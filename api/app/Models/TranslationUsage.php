<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TranslationUsage extends Model
{
    protected $table = 'translation_usage';

    protected $fillable = ['provider', 'period', 'characters', 'character_limit', 'exhausted_at'];

    protected function casts(): array
    {
        return [
            'characters' => 'integer',
            'character_limit' => 'integer',
            'exhausted_at' => 'immutable_datetime',
        ];
    }
}
