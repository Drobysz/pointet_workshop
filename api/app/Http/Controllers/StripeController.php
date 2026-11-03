<?php

namespace App\Http\Controllers;

use App\Http\Resources\PreorderCheckoutSessionResource;
use App\Models\PreorderCheckoutSession;
use App\Services\Checkout\PreorderService;
use App\Services\Checkout\GuestSessionService;
use Illuminate\Http\Request;

class StripeController extends Controller
{
    public function __construct(private readonly PreorderService $preorders) {}

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        abort_unless($this->hasValidSignature($payload, (string) $request->header('Stripe-Signature')), 400, 'Invalid Stripe signature.');
        $event = json_decode($payload, true);
        abort_unless(is_array($event), 400, 'Invalid Stripe payload.');
        $this->preorders->handleStripeEvent($event);

        return response()->json(['received' => true]);
    }

    public function checkoutSession(Request $request, string $sessionId, GuestSessionService $guests): PreorderCheckoutSessionResource
    {
        $checkout = PreorderCheckoutSession::query()
            ->where('stripe_checkout_session_id', $sessionId)
            ->firstOrFail();
        $user = $request->user();
        $isAuthenticatedOwner = $user && ($user->isAdmin() || $checkout->user_id === $user->id);
        $guest = $guests->resolve($request);
        $isGuestOwner = ! $checkout->user_id && $guest && $checkout->guest_session_id === $guest->id;
        abort_unless($isAuthenticatedOwner || $isGuestOwner, 403);

        return new PreorderCheckoutSessionResource($checkout);
    }

    private function hasValidSignature(string $payload, string $header): bool
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if ($secret === '' || $header === '') {
            return false;
        }
        $parts = [];
        foreach (explode(',', $header) as $segment) {
            [$key, $value] = array_pad(explode('=', trim($segment), 2), 2, null);
            if ($key && $value) {
                $parts[$key][] = $value;
            }
        }
        $timestamp = $parts['t'][0] ?? null;
        if (! ctype_digit((string) $timestamp) || abs(time() - (int) $timestamp) > 300) {
            return false;
        }
        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        foreach ($parts['v1'] ?? [] as $signature) {
            if (hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }
}
