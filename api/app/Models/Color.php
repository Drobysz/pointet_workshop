<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Color extends Model implements Translatable
{
    use HasFactory, HasTranslations;

    protected $fillable = ['name', 'hexcode', 'source_locale'];

    public function goods(): BelongsToMany
    {
        return $this->belongsToMany(Good::class, 'good_register')->distinct();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
