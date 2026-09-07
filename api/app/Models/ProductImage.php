<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $table = 'images';

    protected $fillable = ['good_id', 'color_id', 'name', 'path', 'url', 'sort_order'];

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class);
    }
}
