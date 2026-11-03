<?php

namespace App\Services\Checkout;

use App\Models\GuestSession;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

class GuestSessionService
{
    public function resolve(Request $request): ?GuestSession
    {
        $token = $request->cookie(config('guest_sessions.cookie'));
        if (! is_string($token) || $token === '') {
            return null;
        }

        return GuestSession::query()
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    /** @return array{session: GuestSession, cookie: ?Cookie} */
    public function resolveOrCreate(Request $request): array
    {
        if ($session = $this->resolve($request)) {
            return ['session' => $session, 'cookie' => null];
        }

        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $session = GuestSession::create([
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(config('guest_sessions.ttl_days')),
        ]);

        return ['session' => $session, 'cookie' => $this->cookieFor($token)];
    }

    private function cookieFor(?string $token): Cookie
    {
        return new Cookie(
            config('guest_sessions.cookie'),
            $token,
            now()->addDays(config('guest_sessions.ttl_days')),
            '/',
            config('guest_sessions.domain') ?: null,
            (bool) config('guest_sessions.secure'),
            true,
            false,
            Cookie::SAMESITE_LAX,
        );
    }
}
