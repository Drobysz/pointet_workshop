<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\AuthRefreshToken;
use App\Models\Order;
use App\Models\OrderCheckoutSession;
use App\Models\OrderTrackingLink;
use App\Models\Preorder;
use App\Models\SellerApplication;
use App\Models\TransactionalEmail;
use App\Models\User;
use App\Services\Checkout\OrderCheckoutService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TransactionalEmails
{
    public function sellerApplication(SellerApplication $application): void
    {
        $this->record('seller', (string) $application->id, $application->email);
    }

    public function welcome(User $user): void
    {
        $this->record('welcome', (string) $user->id, $user->email, $user->language, ['name' => $user->full_name]);
    }

    public function newDevice(User $user, AuthRefreshToken $session): void
    {
        $agent = $session->user_agent ?? '';

        $this->record('device', $session->family_id, $user->email, $user->language, [
            'name' => $user->full_name,
            'date' => $session->created_at->toISOString(),
            'browser' => match (true) {
                preg_match('/\b(?:Edg|EdgA|EdgiOS)\//', $agent) === 1 => 'Microsoft Edge',
                preg_match('/\bOPR\//', $agent) === 1 => 'Opera',
                preg_match('/\b(?:Chrome|CriOS)\//', $agent) === 1 => 'Chrome',
                preg_match('/\b(?:Firefox|FxiOS)\//', $agent) === 1 => 'Firefox',
                str_contains($agent, 'Version/') && str_contains($agent, 'Safari/') => 'Safari',
                default => null,
            },
            'os' => match (true) {
                str_contains($agent, 'Android') => 'Android',
                str_contains($agent, 'iPhone'), str_contains($agent, 'iPad') => 'iOS',
                str_contains($agent, 'Windows NT') => 'Windows',
                str_contains($agent, 'Macintosh') => 'macOS',
                str_contains($agent, 'Linux') => 'Linux',
                default => null,
            },
        ]);
    }

    public function paidPreorder(Preorder $preorder): void
    {
        $user = $preorder->user;
        $locale = $this->locale($user?->language);
        $frontend = rtrim((string) config('services.frontend.url'), '/');
        $url = filter_var($frontend, FILTER_VALIDATE_URL) ? parse_url($frontend) : [];
        $detailsUrl = $user && in_array($url['scheme'] ?? null, ['http', 'https'], true)
            && ! isset($url['user']) && ! isset($url['query']) && ! isset($url['fragment'])
            ? "{$frontend}/{$locale}/profile/preorders/{$preorder->id}"
            : null;

        $this->record(
            'preorder',
            (string) $preorder->id,
            $preorder->user_id ? $user?->email : $preorder->customer_email,
            $locale,
            [
                'name' => $user?->full_name,
                'reference' => $preorder->id,
                'date' => $preorder->created_at->toISOString(),
                'amount_cents' => $preorder->payment_amount_cents,
                'currency' => $preorder->currency,
                'items' => $preorder->registers()->get(['product_name', 'color_name', 'size', 'quantity'])->toArray(),
                'details_url' => $detailsUrl,
            ],
        );
    }

    public function paidOrder(Order $order, OrderCheckoutSession $checkout): void
    {
        $user = $order->user;
        $locale = $this->locale($user?->language);
        $detailsUrl = $this->orderDetailsUrl($order, $locale);
        $name = $order->customer_name !== OrderCheckoutService::GUEST_NAME ? $order->customer_name : null;

        $this->record(
            'order',
            (string) $order->id,
            $order->user_id ? $user?->email : $order->customer_email,
            $locale,
            [
                'name' => $name,
                'reference' => $order->id,
                'date' => $order->placed_at?->toISOString() ?? $order->created_at->toISOString(),
                'amount_cents' => $checkout->payment_amount_cents,
                'delivery_cents' => $checkout->delivery_cents,
                'currency' => $checkout->currency,
                'items' => $order->items()->get(['product_name', 'color_name', 'size', 'quantity'])->toArray(),
                'delivery' => array_filter(['name' => $name, 'address' => $order->customer_address]) ?: null,
                'details_url' => $detailsUrl,
            ],
        );
    }

    /** Tells the order's initiator that an administrator moved the order to a new status. */
    public function orderStatusChanged(Order $order, OrderStatus $status): void
    {
        $user = $order->user;
        $locale = $this->locale($user?->language);
        $name = $order->customer_name !== OrderCheckoutService::GUEST_NAME ? $order->customer_name : null;

        $this->record(
            'status_'.$status->value,
            // A status can change many times, so every change is its own event.
            $order->id.':'.Str::uuid(),
            $order->user_id ? $user?->email : $order->customer_email,
            $locale,
            [
                'name' => $name,
                'reference' => $order->id,
                'date' => now()->toISOString(),
                'details_url' => $this->orderDetailsUrl($order, $locale),
            ],
        );
    }

    /** Storefront link to the order; only accounts can open it, and only for a well-formed frontend URL. */
    private function orderDetailsUrl(Order $order, string $locale): ?string
    {
        $frontend = rtrim((string) config('services.frontend.url'), '/');
        $url = filter_var($frontend, FILTER_VALIDATE_URL) ? parse_url($frontend) : [];

        return $order->user_id && in_array($url['scheme'] ?? null, ['http', 'https'], true)
            && ! isset($url['user']) && ! isset($url['query']) && ! isset($url['fragment'])
            ? "{$frontend}/{$locale}/profile/orders/{$order->id}"
            : null;
    }

    /** Tells the order's initiator (account holder or guest checkout email) that a tracking link was added. */
    public function orderTracking(Order $order, OrderTrackingLink $link): void
    {
        $user = $order->user;
        $locale = $this->locale($user?->language);
        $name = $order->customer_name !== OrderCheckoutService::GUEST_NAME ? $order->customer_name : null;

        $this->record(
            'tracking',
            (string) $link->id,
            $order->user_id ? $user?->email : $order->customer_email,
            $locale,
            [
                'name' => $name,
                'reference' => $order->id,
                'date' => $link->created_at->toISOString(),
                'details_url' => $link->tracking_url,
            ],
        );
    }

    private function locale(?string $locale): string
    {
        return in_array($locale, ['en', 'fr', 'de', 'it', 'ru', 'uk'], true) ? $locale : 'en';
    }

    private function record(string $template, string $id, ?string $recipient, ?string $locale = null, array $data = []): void
    {
        $eventKey = "{$template}:{$id}";
        if (Validator::make(['email' => $recipient], ['email' => ['required', 'email:rfc']])->fails()) {
            Log::warning('Transactional email skipped because a valid recipient was unavailable.', ['event' => $eventKey]);

            return;
        }

        // The event and its email intent commit together. Only the queue worker performs delivery.
        TransactionalEmail::query()->createOrFirst(['event_key' => $eventKey], [
            'template' => $template,
            'locale' => $this->locale($locale),
            'payload' => ['recipient' => $recipient, 'data' => $data],
            'available_at' => now(),
        ]);
    }
}
