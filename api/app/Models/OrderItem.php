<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'good_id', 'product_name', 'color_name', 'size', 'good_register_id', 'unit_price', 'quantity', 'status'];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'quantity' => 'integer', 'status' => OrderStatus::class];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class);
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(GoodRegister::class, 'good_register_id');
    }
}
