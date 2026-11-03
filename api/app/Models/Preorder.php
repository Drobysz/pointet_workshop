<?php

namespace App\Models;

use App\Enums\PreorderPaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Preorder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'guest_session_id', 'customer_name', 'customer_email', 'payment_status',
        'payment_amount_cents', 'currency', 'idempotency_key',
        'stripe_checkout_session_id', 'stripe_checkout_url', 'stripe_payment_intent_id', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'payment_status' => PreorderPaymentStatus::class,
            'payment_amount_cents' => 'integer',
            'paid_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guestSession(): BelongsTo
    {
        return $this->belongsTo(GuestSession::class);
    }

    public function registers(): HasMany
    {
        return $this->hasMany(PreorderRegister::class);
    }
}
