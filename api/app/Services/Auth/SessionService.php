<?php

namespace App\Services\Auth;

use App\Models\AuthRefreshToken;
use App\Models\User;
use App\Services\TransactionalEmails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SessionService
{
    public function __construct(
        private readonly AccessTokenService $accessTokens,
        private readonly TransactionalEmails $emails,
    ) {}

    public function create(User $user, Request $request): array
    {
        return DB::transaction(function () use ($user, $request): array {
            // Session creation, rotation and revocation share this lock so a sign-in sees a stable active set.
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $device = $this->deviceCookie($request) ?? $this->randomToken(32);
            $deviceHash = hash('sha256', $device);
            $agent = $this->userAgent($request);
            $active = $user->refreshTokens()->whereNull('revoked_at')->where('expires_at', '>', now());
            $hasActiveSession = (clone $active)->exists();
            $knownDevice = $hasActiveSession && (
                $user->refreshTokens()->where('device_hash', $deviceHash)->exists()
                // Pre-upgrade sessions have no device cookie. Use the stored user agent as a conservative fallback.
                || ($agent !== '' && $active->whereNull('device_hash')->where('user_agent', $agent)->exists())
            );

            [$session, $tokens] = $this->persist($user, $request, (string) Str::uuid(), $deviceHash);
            if ($hasActiveSession && ! $knownDevice) {
                $this->emails->newDevice($user, $session);
            }

            return [...$tokens, 'device' => $device];
        }, 3);
    }

    public function rotate(string $raw, Request $request): ?array
    {
        $hash = hash('sha256', $raw);
        $userId = AuthRefreshToken::query()->where('token_hash', $hash)->value('user_id');
        if (! $userId) {
            return null;
        }

        return DB::transaction(function () use ($hash, $userId, $request): ?array {
            $user = User::query()->lockForUpdate()->find($userId);
            $session = $user?->refreshTokens()->where('token_hash', $hash)->lockForUpdate()->first();
            if (! $session || $session->expires_at->isPast()) {
                return null;
            }
            if ($session->revoked_at !== null) {
                $user->refreshTokens()->whereNull('revoked_at')->update(['revoked_at' => now()]);

                return ['replayed' => true];
            }

            $session->update(['revoked_at' => now(), 'last_used_at' => now()]);
            $device = $session->device_hash === null
                ? ($this->deviceCookie($request) ?? $this->randomToken(32))
                : null;

            [, $tokens] = $this->persist(
                $user,
                $request,
                $session->family_id,
                $device ? hash('sha256', $device) : $session->device_hash,
            );

            return [...$tokens, 'device' => $device];
        }, 3);
    }

    public function revoke(string $raw): void
    {
        $hash = hash('sha256', $raw);
        $userId = AuthRefreshToken::query()->where('token_hash', $hash)->value('user_id');
        if (! $userId) {
            return;
        }

        DB::transaction(function () use ($hash, $userId): void {
            $user = User::query()->lockForUpdate()->find($userId);
            $user?->refreshTokens()->where('token_hash', $hash)->whereNull('revoked_at')->update(['revoked_at' => now()]);
        }, 3);
    }

    public function revokeAll(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $locked = User::query()->lockForUpdate()->find($user->id);
            $locked?->refreshTokens()->whereNull('revoked_at')->update(['revoked_at' => now()]);
        }, 3);
    }

    public function attachCookies(JsonResponse $response, array $tokens): JsonResponse
    {
        $cookies = config('auth_tokens.cookies');

        if (isset($tokens['device'])) {
            $response->cookie($cookies['device'], $tokens['device'], 60 * 24 * 365, '/', $cookies['domain'], $cookies['secure'], true, false, $cookies['same_site']);
        }

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

    private function persist(User $user, Request $request, string $familyId, ?string $deviceHash): array
    {
        $raw = $this->randomToken(48);
        $session = AuthRefreshToken::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'family_id' => $familyId,
            'token_hash' => hash('sha256', $raw),
            'expires_at' => now()->addDays(config('auth_tokens.refresh_ttl_days')),
            'user_agent' => $this->userAgent($request),
            'ip_address' => $request->ip(),
            'device_hash' => $deviceHash,
        ]);

        return [$session, ['access' => $this->accessTokens->issue($user), 'refresh' => $raw]];
    }

    private function deviceCookie(Request $request): ?string
    {
        $value = $request->cookie(config('auth_tokens.cookies.device'));

        return is_string($value) && preg_match('/\A[A-Za-z0-9_-]{43}\z/', $value) ? $value : null;
    }

    private function userAgent(Request $request): string
    {
        return mb_substr((string) $request->userAgent(), 0, 1024);
    }

    private function randomToken(int $bytes): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }
}
