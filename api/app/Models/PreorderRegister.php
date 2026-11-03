<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreorderRegister extends Model
{
    use HasFactory;

    protected $fillable = [
        'preorder_id', 'good_id', 'good_register_id', 'product_name',
        'color_name', 'size', 'original_unit_price', 'quantity',
    ];

    protected function casts(): array
    {
        return ['original_unit_price' => 'decimal:2', 'quantity' => 'integer'];
    }

    public function preorder(): BelongsTo
    {
        return $this->belongsTo(Preorder::class);
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
