<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class PendingRegistrationStore
{
    public function put(string $hash, array $pending): void
    {
        if (config('auth_tokens.pending_store') === 'redis') {
            Redis::command('SETEX', [$this->redisKey($hash), 3600 * config('auth_tokens.pending_ttl_hours'), json_encode($pending, JSON_THROW_ON_ERROR)]);

            return;
        }
        Cache::store(config('auth_tokens.pending_store'))->put($this->key($hash), $pending, now()->addHours(config('auth_tokens.pending_ttl_hours')));
    }

    public function consume(string $hash): ?array
    {
        if (config('auth_tokens.pending_store') === 'redis') {
            $raw = Redis::command('GETDEL', [$this->redisKey($hash)]);

            return is_string($raw) ? json_decode($raw, true, flags: JSON_THROW_ON_ERROR) : null;
        }

        $value = Cache::store(config('auth_tokens.pending_store'))->pull($this->key($hash));

        return is_array($value) ? $value : null;
    }

    public function forget(string $hash): void
    {
        if (config('auth_tokens.pending_store') === 'redis') {
            Redis::del($this->redisKey($hash));

            return;
        }
        Cache::store(config('auth_tokens.pending_store'))->forget($this->key($hash));
    }

    public function markUsed(string $hash): void
    {
        Cache::store(config('auth_tokens.pending_store'))->put("account:pending-used:{$hash}", true, now()->addDay());
    }

    public function wasUsed(string $hash): bool
    {
        return Cache::store(config('auth_tokens.pending_store'))->has("account:pending-used:{$hash}");
    }

    private function key(string $hash): string
    {
        return "account:pending:{$hash}";
    }

    private function redisKey(string $hash): string
    {
        $prefix = config('cache.prefix');

        return $prefix.$this->key($hash);
    }
}
