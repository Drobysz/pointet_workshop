<?php

namespace App\Models;

use App\Enums\PreorderPaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A private payment attempt and its immutable basket snapshot.
 *
 * This is deliberately separate from Preorder: a customer has not placed a
 * pre-order until Stripe confirms that the payment was successful.
 */
class PreorderCheckoutSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'guest_session_id', 'customer_name', 'customer_email', 'basket_snapshot',
        'payment_status', 'payment_amount_cents', 'currency', 'idempotency_key',
        'stripe_checkout_session_id', 'stripe_checkout_url', 'stripe_payment_intent_id',
        'preorder_id', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'basket_snapshot' => 'array',
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

    public function preorder(): BelongsTo
    {
        return $this->belongsTo(Preorder::class);
    }
}
