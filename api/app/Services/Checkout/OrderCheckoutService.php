<?php

namespace App\Services\Checkout;

use App\Enums\OrderStatus;
use App\Enums\PreorderPaymentStatus;
use App\Models\Basket;
use App\Models\GuestSession;
use App\Models\Order;
use App\Models\OrderCheckoutSession;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Services\TransactionalEmails;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

/**
 * Payment-first order flow, mirroring PreorderService:
 * checkout session + Stripe page -> payment -> webhook verification -> Order.
 */
class OrderCheckoutService
{
    public const METADATA_KEY = 'order_checkout_session_id';

    /** Placeholder stored while a guest has not given a name. */
    public const GUEST_NAME = 'Guest checkout';

    public function __construct(
        private readonly GuestBasketService $guestBaskets,
        private readonly InventoryDeduction $inventory,
        private readonly TransactionalEmails $emails,
    ) {}

    /** @param array<int, array{inventory_id: int, quantity: int}> $guestItems */
    public function startCheckoutFromBasket(?User $user, ?GuestSession $guestSession, string $idempotencyKey, array $guestItems = [], ?string $guestEmail = null, ?string $guestName = null, ?string $guestAddress = null): OrderCheckoutSession
    {
        abort_unless(config('checkout.mode') === 'standard', 409, 'Order checkout mode is not enabled.');
        abort_unless(config('services.stripe.secret'), 503, 'Stripe checkout is not configured.');

        abort_unless($user || $guestSession, 422, 'A customer session is required.');
        $customerEmail = $user?->email ?? $guestEmail;
        abort_unless($customerEmail, 422, 'An email address is required for guest checkout.');

        $checkout = DB::transaction(function () use ($user, $guestSession, $idempotencyKey, $guestItems, $customerEmail, $guestName, $guestAddress): OrderCheckoutSession {
            $existing = OrderCheckoutSession::query()
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
            $amountCents = 0;
            // Distinct brands, like `new Set(brands)` in the storefront: a missing brand
            // counts as one value, and brands are compared exactly.
            $brands = [];
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
                    'unit_price' => $good->price,
                    'quantity' => $item->quantity,
                ];
                $amountCents += $this->toCents($good->price) * $item->quantity;
                $brands[serialize($good->brand)] = true;
            }
            abort_if($amountCents < 1, 422, 'The order total must be greater than zero.');
            $deliveryCents = count($brands) * (int) config('checkout.delivery_fee_per_brand_cents');
            $amountCents += $deliveryCents;

            return OrderCheckoutSession::create([
                'user_id' => $user?->id,
                'guest_session_id' => $guestSession?->id,
                // Accounts always use their stored details; only guests can supply their own.
                'customer_name' => $user ? $user->full_name : (filled($guestName) ? $guestName : self::GUEST_NAME),
                'customer_email' => $customerEmail,
                'customer_address' => $user ? (filled($user->address) ? $user->address : null) : (filled($guestAddress) ? $guestAddress : null),
                'basket_snapshot' => $snapshot,
                'payment_status' => PreorderPaymentStatus::Pending,
                'payment_amount_cents' => $amountCents,
                'delivery_cents' => $deliveryCents,
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
            $checkoutId = $session['metadata'][self::METADATA_KEY] ?? null;
            if (! is_numeric($checkoutId)) {
                return;
            }
            $checkout = OrderCheckoutSession::query()->lockForUpdate()->find($checkoutId);
            if (! $checkout || $checkout->stripe_checkout_session_id !== ($session['id'] ?? null)) {
                return;
            }

            $this->applyStripeSession($checkout, $type, $session);
        }, 3);
    }

    /**
     * Webhooks are the primary path, but they can be delayed or never arrive
     * (e.g. no `stripe listen` forwarder locally). While a checkout is still
     * pending, ask Stripe directly so the success page can create the order.
     * Verification is equivalent to a webhook: the session is read from Stripe
     * with our secret key, never taken from the request.
     */
    public function syncWithStripe(OrderCheckoutSession $checkout): OrderCheckoutSession
    {
        if ($checkout->payment_status !== PreorderPaymentStatus::Pending
            || ! $checkout->stripe_checkout_session_id
            || ! config('services.stripe.secret')) {
            return $checkout;
        }

        try {
            $session = $this->stripeRequest($checkout)
                ->get('checkout/sessions/'.$checkout->stripe_checkout_session_id)
                ->throw()->json();
        } catch (\Throwable $e) {
            // Stripe being unreachable must not break the page; the webhook can still arrive.
            report($e);

            return $checkout;
        }
        if (! is_array($session) || ($session['id'] ?? null) !== $checkout->stripe_checkout_session_id) {
            return $checkout;
        }
        $type = ($session['payment_status'] ?? null) === 'paid'
            ? 'checkout.session.completed'
            : (($session['status'] ?? null) === 'expired' ? 'checkout.session.expired' : null);
        if ($type === null) {
            return $checkout;
        }

        DB::transaction(function () use ($checkout, $type, $session): void {
            $locked = OrderCheckoutSession::query()->lockForUpdate()->find($checkout->id);
            if ($locked) {
                $this->applyStripeSession($locked, $type, $session);
            }
        }, 3);

        return $checkout->refresh();
    }

    /**
     * Applies a Stripe Checkout Session (from a webhook event or a direct API
     * lookup) to its checkout. Must run in a transaction with $checkout locked.
     * Safe to call repeatedly: a paid checkout is never fulfilled twice.
     */
    private function applyStripeSession(OrderCheckoutSession $checkout, string $type, array $session): void
    {
        if (in_array($type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
            // A delayed payment method can emit checkout.session.completed
            // while payment_status is still "unpaid". Leave the checkout
            // pending for the later async_payment_succeeded event.
            if (($session['payment_status'] ?? null) !== 'paid') {
                return;
            }
            $validPayment = (int) ($session['amount_total'] ?? 0) === $checkout->payment_amount_cents
                && strtolower((string) ($session['currency'] ?? '')) === $checkout->currency;
            abort_unless($validPayment, 422, 'Invalid order payment amount.');

            if ($checkout->payment_status === PreorderPaymentStatus::Paid || $checkout->order_id) {
                return;
            }

            $this->inventory->deduct($checkout->basket_snapshot);

            $customerDetails = is_array($session['customer_details'] ?? null) ? $session['customer_details'] : [];
            // Contact and delivery details are the ones entered at checkout. Stripe's
            // cardholder name is only a fallback for guests who gave no name.
            $customerName = $checkout->customer_name === self::GUEST_NAME && is_string($customerDetails['name'] ?? null)
                ? $customerDetails['name']
                : $checkout->customer_name;
            $paymentIntent = is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : null;

            $order = Order::create([
                'user_id' => $checkout->user_id,
                'guest_session_id' => $checkout->guest_session_id,
                'customer_name' => $customerName,
                'customer_email' => $checkout->customer_email,
                'customer_address' => $checkout->customer_address,
                'status' => OrderStatus::Processing,
                'placed_at' => now(),
            ]);
            foreach ($checkout->basket_snapshot as $line) {
                $order->items()->create($line + ['status' => OrderStatus::Processing]);
            }
            if ($checkout->user_id) {
                Basket::query()->where('user_id', $checkout->user_id)->delete();
            }
            $checkout->update([
                'payment_status' => PreorderPaymentStatus::Paid,
                'stripe_payment_intent_id' => $paymentIntent,
                'order_id' => $order->id,
                'paid_at' => now(),
            ]);
            $this->emails->paidOrder($order, $checkout);
        } elseif ($checkout->payment_status !== PreorderPaymentStatus::Paid && $type === 'checkout.session.expired') {
            $checkout->update(['payment_status' => PreorderPaymentStatus::Canceled]);
        } elseif ($checkout->payment_status !== PreorderPaymentStatus::Paid && $type === 'checkout.session.async_payment_failed') {
            $checkout->update(['payment_status' => PreorderPaymentStatus::Failed]);
        }
    }

    private function createStripeSession(OrderCheckoutSession $checkout): array
    {
        $payload = [
            'mode' => 'payment',
            'customer_email' => $checkout->customer_email,
            'client_reference_id' => (string) $checkout->id,
            'success_url' => config('checkout.success_url'),
            'cancel_url' => config('checkout.order_cancel_url'),
            'metadata['.self::METADATA_KEY.']' => (string) $checkout->id,
        ];
        foreach (array_values($checkout->basket_snapshot) as $index => $line) {
            $variant = collect([$line['color_name'] ?? null, $line['size'] ?? null])->filter()->implode(', ');
            $payload["line_items[{$index}][quantity]"] = (int) $line['quantity'];
            $payload["line_items[{$index}][price_data][currency]"] = $checkout->currency;
            $payload["line_items[{$index}][price_data][unit_amount]"] = $this->toCents($line['unit_price']);
            $payload["line_items[{$index}][price_data][product_data][name]"] = $variant === ''
                ? $line['product_name']
                : "{$line['product_name']} ({$variant})";
        }
        if ($checkout->delivery_cents > 0) {
            // Shown as its own line so the Stripe page adds up to the total charged.
            $index = count($checkout->basket_snapshot);
            $payload["line_items[{$index}][quantity]"] = 1;
            $payload["line_items[{$index}][price_data][currency]"] = $checkout->currency;
            $payload["line_items[{$index}][price_data][unit_amount]"] = $checkout->delivery_cents;
            $payload["line_items[{$index}][price_data][product_data][name]"] = 'Delivery';
        }

        $response = $this->stripeRequest($checkout)->post('checkout/sessions', $payload)->throw()->json();

        abort_unless(is_array($response) && isset($response['id'], $response['url']), 502, 'Stripe did not return a checkout session.');

        return $response;
    }

    private function stripeRequest(OrderCheckoutSession $checkout): PendingRequest
    {
        return Http::baseUrl('https://api.stripe.com/v1/')
            ->withBasicAuth((string) config('services.stripe.secret'), '')
            ->withHeaders(['Idempotency-Key' => "order-checkout:{$checkout->id}"])
            ->asForm()
            ->acceptJson();
    }

    private function toCents(string|int|float $price): int
    {
        return (int) round(((float) $price) * 100);
    }
}
