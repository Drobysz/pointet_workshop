<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuestSession extends Model
{
    use HasFactory;

    protected $fillable = ['token_hash', 'expires_at', 'revoked_at'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'immutable_datetime',
            'revoked_at' => 'immutable_datetime',
        ];
    }

    public function preorders(): HasMany
    {
        return $this->hasMany(Preorder::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
