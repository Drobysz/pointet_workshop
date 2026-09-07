<?php

namespace App\Services\Auth;

use App\Models\AuthRefreshToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SessionService
{
    public function __construct(private readonly AccessTokenService $accessTokens) {}

    public function create(User $user, Request $request, ?string $familyId = null): array
    {
        $raw = $this->randomToken(48);
        AuthRefreshToken::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'family_id' => $familyId ?: (string) Str::uuid(),
            'token_hash' => hash('sha256', $raw),
            'expires_at' => now()->addDays(config('auth_tokens.refresh_ttl_days')),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1024),
            'ip_address' => $request->ip(),
        ]);

        return ['access' => $this->accessTokens->issue($user), 'refresh' => $raw];
    }

    public function rotate(string $raw, Request $request): ?array
    {
        return DB::transaction(function () use ($raw, $request): ?array {
            $session = AuthRefreshToken::query()->where('token_hash', hash('sha256', $raw))->lockForUpdate()->first();
            if (! $session || $session->expires_at->isPast()) {
                return null;
            }
            if ($session->revoked_at !== null) {
                AuthRefreshToken::query()->where('user_id', $session->user_id)->whereNull('revoked_at')->update(['revoked_at' => now()]);

                return ['replayed' => true];
            }

            $updated = AuthRefreshToken::query()->whereKey($session->id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'last_used_at' => now()]);
            if ($updated !== 1) {
                AuthRefreshToken::query()->where('user_id', $session->user_id)->whereNull('revoked_at')->update(['revoked_at' => now()]);

                return ['replayed' => true];
            }

            return $this->create($session->user, $request, $session->family_id);
        }, 3);
    }

    public function revoke(string $raw): void
    {
        AuthRefreshToken::query()->where('token_hash', hash('sha256', $raw))->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }

    public function revokeAll(User $user): void
    {
        $user->refreshTokens()->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }

    public function attachCookies(JsonResponse $response, array $tokens): JsonResponse
    {
        $cookies = config('auth_tokens.cookies');

        return $response
            ->cookie($cookies['access'], $tokens['access'], config('auth_tokens.access_ttl_minutes'), '/', $cookies['domain'], $cookies['secure'], true, false, $cookies['same_site'])
            ->cookie($cookies['refresh'], $tokens['refresh'], 60 * 24 * config('auth_tokens.refresh_ttl_days'), '/', $cookies['domain'], $cookies['secure'], true, false, $cookies['same_site']);
    }

    public function clearCookies(JsonResponse $response): JsonResponse
    {
        $cookies = config('auth_tokens.cookies');

        return $response
            ->withoutCookie($cookies['access'], '/', $cookies['domain'])
            ->withoutCookie($cookies['refresh'], '/', $cookies['domain']);
    }

    private function randomToken(int $bytes): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }
}
