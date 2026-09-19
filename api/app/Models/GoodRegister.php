<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodRegister extends Model
{
    protected $table = 'good_register';

    public $timestamps = false;

    protected $fillable = ['color_id', 'size', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class);
    }
}
