<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodTranslation extends Model
{
    protected $fillable = [
        'good_id', 'locale', 'name', 'description', 'short_description', 'meta_title', 'meta_description',
        'name_source_hash', 'name_is_manual',
    ];

    protected function casts(): array
    {
        return ['name_is_manual' => 'boolean'];
    }

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class);
    }
}
