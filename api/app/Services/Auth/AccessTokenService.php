<?php

namespace App\Services\Auth;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;
use RuntimeException;

class AccessTokenService
{
    public function issue(User $user): string
    {
        $now = now();
        $payload = [
            'iss' => config('auth_tokens.issuer'),
            'aud' => config('auth_tokens.audience'),
            'sub' => (string) $user->getKey(),
            'iat' => $now->timestamp,
            'nbf' => $now->timestamp,
            'exp' => $now->addMinutes(config('auth_tokens.access_ttl_minutes'))->timestamp,
            'jti' => (string) Str::uuid(),
            'is_admin' => $user->isAdmin(),
        ];

        return JWT::encode($payload, $this->key('private'), 'RS256', config('auth_tokens.key_id'));
    }

    public function userId(string $token): int
    {
        $claims = JWT::decode($token, new Key($this->key('public'), 'RS256'));
        if (($claims->iss ?? null) !== config('auth_tokens.issuer') || ($claims->aud ?? null) !== config('auth_tokens.audience')) {
            throw new RuntimeException('Invalid token scope.');
        }

        return (int) $claims->sub;
    }

    private function key(string $type): string
    {
        $inline = config("auth_tokens.{$type}_key");
        $path = config("auth_tokens.{$type}_key_path");
        $value = $inline ?: ($path && is_readable($path) ? file_get_contents($path) : false);
        if (! is_string($value) || trim($value) === '') {
            throw new RuntimeException("JWT {$type} key is not configured.");
        }

        return str_replace('\\n', "\n", $value);
    }
}
