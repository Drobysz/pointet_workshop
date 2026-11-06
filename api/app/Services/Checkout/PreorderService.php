<?php

namespace App\Services\Checkout;

use App\Enums\PreorderPaymentStatus;
use App\Models\Basket;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Models\GuestSession;
use App\Models\Preorder;
use App\Models\PreorderCheckoutSession;
use App\Models\ProductImage;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Services\TransactionalEmails;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PreorderService
{
    public function __construct(
        private readonly GuestBasketService $guestBaskets,
        private readonly TransactionalEmails $emails,
    ) {}

    /** @param array<int, array{inventory_id: int, quantity: int}> $guestItems */
    public function startCheckoutFromBasket(?User $user, ?GuestSession $guestSession, string $idempotencyKey, array $guestItems = [], ?string $guestEmail = null): PreorderCheckoutSession
    {
        abort_unless(config('checkout.mode') === 'preorder', 409, 'Pre-order checkout mode is not enabled.');
        $this->assertStripeConfigured();

        abort_unless($user || $guestSession, 422, 'A customer session is required.');
        $customerEmail = $user?->email ?? $guestEmail;
        abort_unless($customerEmail, 422, 'An email address is required for guest checkout.');

        $checkout = DB::transaction(function () use ($user, $guestSession, $idempotencyKey, $guestItems, $customerEmail): PreorderCheckoutSession {
            $existing = PreorderCheckoutSession::query()
                ->when($user, fn ($query) => $query->where('user_id', $user->id), fn ($query) => $query->where('guest_session_id', $guestSession->id))
                ->where('idempotency_key', $idempotencyKey)
                ->lockForUpdate()
                ->first();
            if ($existing) {
                // A retry must not silently redirect a guest to a payment with
                // a different contact email already attached to it.
                abort_if(! $user && $existing->customer_email !== $customerEmail, 409, 'Start a new checkout to change the contact email.');

                return $existing;
            }

            $basket = $user
                ? $user->basketItems()->with(['good', 'inventory.color'])->lockForUpdate()->get()
                : $this->guestBaskets->validatedItems($guestItems);
            abort_if($basket->isEmpty(), 422, 'Your basket is empty.');

            $snapshot = [];
            foreach ($basket as $item) {
                $good = $item->good;
                $register = $item->inventory;
                abort_unless($good?->visible && $register && $register->good_id === $good->id, 422, 'One of the selected products is no longer available.');
                abort_if($item->quantity > $register->quantity, 422, 'The requested quantity exceeds available stock for this product option.');
                $snapshot[] = [
                    'good_id' => $good->id,
                    'good_register_id' => $register->id,
                    'product_name' => $good->name,
                    'color_name' => $register->color?->name,
                    'size' => $register->size,
                    'original_unit_price' => $good->price,
                    'quantity' => $item->quantity,
                ];
            }

            return PreorderCheckoutSession::create([
                'user_id' => $user?->id,
                'guest_session_id' => $guestSession?->id,
                'customer_name' => $user?->full_name ?? 'Guest checkout',
                'customer_email' => $customerEmail,
                'basket_snapshot' => $snapshot,
                'payment_status' => PreorderPaymentStatus::Pending,
                'payment_amount_cents' => config('checkout.preorder_amount_cents'),
                'currency' => config('checkout.currency'),
                'idempotency_key' => $idempotencyKey,
            ]);
        }, 3);

        if (! $checkout->stripe_checkout_session_id) {
            $session = $this->createStripeSession($checkout);
            $checkout->update([
                'stripe_checkout_session_id' => $session['id'],
                'stripe_checkout_url' => $session['url'],
            ]);
        }

        return $checkout;
    }

    public function analytics(array $filters)
    {
        $perPage = $filters['per_page'] ?? 20;

        return Good::query()
            ->select('goods.id', 'goods.name', 'goods.price')
            ->selectSub(
                ProductImage::query()
                    ->select('url')
                    ->whereColumn('good_id', 'goods.id')
                    ->orderBy('sort_order')
                    ->limit(1),
                'image_url',
            )
            ->leftJoin('preorder_registers', 'preorder_registers.good_id', '=', 'goods.id')
            ->leftJoin('preorders', function ($join): void {
                $join->on('preorders.id', '=', 'preorder_registers.preorder_id')
                    ->where('preorders.payment_status', PreorderPaymentStatus::Paid->value);
            })
            ->selectRaw('COALESCE(SUM(CASE WHEN preorders.id IS NULL THEN 0 ELSE preorder_registers.quantity END), 0) as preordered_quantity')
            ->groupBy('goods.id', 'goods.name', 'goods.price')
            ->orderByDesc('preordered_quantity')
            ->orderBy('goods.id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function handleStripeEvent(array $event): void
    {
        $eventId = $event['id'] ?? null;
        $type = $event['type'] ?? null;
        abort_unless(is_string($eventId) && is_string($type), 422, 'Invalid Stripe event.');

        DB::transaction(function () use ($event, $eventId, $type): void {
            $receipt = StripeWebhookEvent::query()->createOrFirst(
                ['stripe_event_id' => $eventId],
                ['type' => $type, 'processed_at' => now()],
            );
            if (! $receipt->wasRecentlyCreated) {
                return;
            }

            $session = $event['data']['object'] ?? [];
            $checkoutId = $session['metadata']['preorder_checkout_session_id'] ?? null;
            if (! is_numeric($checkoutId)) {
                return;
            }
            $checkout = PreorderCheckoutSession::query()->lockForUpdate()->find($checkoutId);
            if (! $checkout || $checkout->stripe_checkout_session_id !== ($session['id'] ?? null)) {
                return;
            }

            if (in_array($type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
                // A delayed payment method can emit checkout.session.completed
                // while payment_status is still "unpaid". It is not a payment
                // failure, so leave the private checkout pending for the later
                // async_payment_succeeded event instead of creating a preorder.
                if (($session['payment_status'] ?? null) !== 'paid') {
                    return;
                }
                $validPayment = (int) ($session['amount_total'] ?? 0) === $checkout->payment_amount_cents
                    && strtolower((string) ($session['currency'] ?? '')) === $checkout->currency;
                abort_unless($validPayment, 422, 'Invalid pre-order payment amount.');

                if ($checkout->payment_status === PreorderPaymentStatus::Paid || $checkout->preorder_id) {
                    return;
                }

                $this->deductInventory($checkout->basket_snapshot);

                $customerDetails = is_array($session['customer_details'] ?? null) ? $session['customer_details'] : [];
                $customerEmail = $checkout->customer_email;
                if ($checkout->user_id && is_string($customerDetails['email'] ?? null)) {
                    $customerEmail = $customerDetails['email'];
                }
                $customerName = is_string($customerDetails['name'] ?? null) ? $customerDetails['name'] : $checkout->customer_name;

                $preorder = Preorder::create([
                    'user_id' => $checkout->user_id,
                    'guest_session_id' => $checkout->guest_session_id,
                    'customer_name' => $customerName,
                    'customer_email' => $customerEmail,
                    'payment_status' => PreorderPaymentStatus::Paid,
                    'payment_amount_cents' => $checkout->payment_amount_cents,
                    'currency' => $checkout->currency,
                    'idempotency_key' => $checkout->idempotency_key,
                    'stripe_checkout_session_id' => $checkout->stripe_checkout_session_id,
                    'stripe_checkout_url' => $checkout->stripe_checkout_url,
                    'stripe_payment_intent_id' => is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : null,
                    'paid_at' => now(),
                ]);
                foreach ($checkout->basket_snapshot as $item) {
                    $preorder->registers()->create($item);
                }
                if ($checkout->user_id) {
                    Basket::query()->where('user_id', $checkout->user_id)->delete();
                }
                $checkout->update([
                    'payment_status' => PreorderPaymentStatus::Paid,
                    'stripe_payment_intent_id' => $preorder->stripe_payment_intent_id,
                    'preorder_id' => $preorder->id,
                    'paid_at' => $preorder->paid_at,
                ]);
                $this->emails->paidPreorder($preorder);
            } elseif ($checkout->payment_status !== PreorderPaymentStatus::Paid && $type === 'checkout.session.expired') {
                $checkout->update(['payment_status' => PreorderPaymentStatus::Canceled]);
            } elseif ($checkout->payment_status !== PreorderPaymentStatus::Paid && $type === 'checkout.session.async_payment_failed') {
                $checkout->update(['payment_status' => PreorderPaymentStatus::Failed]);
            }
        }, 3);
    }

    /** @param array<int, array{good_id: int, good_register_id: int, quantity: int}> $items */
    private function deductInventory(array $items): void
    {
        // Match all other stock writers: lock products first, then inventory rows.
        $goods = Good::query()
            ->whereIn('id', array_column($items, 'good_id'))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');
        $variants = GoodRegister::query()
            ->whereIn('id', array_column($items, 'good_register_id'))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

        foreach ($items as $item) {
            $good = $goods->get($item['good_id']);
            $variant = $variants->get($item['good_register_id']);
            $quantity = (int) $item['quantity'];
            abort_unless($good && $variant && $variant->good_id === $good->id && $quantity > 0, 422, 'This inventory selection is no longer available.');
            abort_if($quantity > $variant->quantity, 422, "Insufficient inventory for {$good->name} in the selected color and size.");
            $variant->decrement('quantity', $quantity);
        }

        foreach ($goods as $good) {
            $good->forceFill([
                'current_quantity' => $good->inventory()->sum('quantity'),
                'inventory_version' => $good->inventory_version + 1,
            ])->save();
        }
    }

    private function createStripeSession(PreorderCheckoutSession $checkout): array
    {
        $payload = [
            'mode' => 'payment',
            'customer_email' => $checkout->customer_email,
            'client_reference_id' => (string) $checkout->id,
            'success_url' => config('checkout.success_url'),
            'cancel_url' => config('checkout.cancel_url'),
            'metadata[preorder_checkout_session_id]' => (string) $checkout->id,
            'line_items[0][quantity]' => 1,
            'line_items[0][price_data][currency]' => config('checkout.currency'),
            'line_items[0][price_data][unit_amount]' => config('checkout.preorder_amount_cents'),
            'line_items[0][price_data][product_data][name]' => 'Workshop pre-order',
        ];
        $response = $this->stripeRequest($checkout)->post('checkout/sessions', $payload)->throw()->json();

        abort_unless(is_array($response) && isset($response['id'], $response['url']), 502, 'Stripe did not return a checkout session.');

        return $response;
    }

    private function stripeRequest(PreorderCheckoutSession $checkout): PendingRequest
    {
        return Http::baseUrl('https://api.stripe.com/v1/')
            ->withBasicAuth((string) config('services.stripe.secret'), '')
            ->withHeaders(['Idempotency-Key' => "preorder-checkout:{$checkout->id}"])
            ->asForm()
            ->acceptJson();
    }

    private function assertStripeConfigured(): void
    {
        abort_unless(config('services.stripe.secret'), 503, 'Stripe checkout is not configured.');
    }
}
