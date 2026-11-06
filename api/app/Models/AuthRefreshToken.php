<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthRefreshToken extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'user_id', 'family_id', 'token_hash', 'expires_at', 'revoked_at', 'last_used_at', 'user_agent', 'ip_address', 'device_hash'];

    protected $hidden = ['token_hash', 'device_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'immutable_datetime', 'revoked_at' => 'immutable_datetime', 'last_used_at' => 'immutable_datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
