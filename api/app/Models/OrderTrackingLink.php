<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderTrackingLink extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'user_id', 'tracking_url'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** The admin who added the link. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
