<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model implements Translatable
{
    use HasFactory, HasTranslations;

    protected $fillable = ['name', 'source_locale'];

    public function image(): BelongsTo
    {
        return $this->belongsTo(CategoryImage::class, 'image_id');
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class);
    }

    public function goods(): HasMany
    {
        return $this->hasMany(Good::class);
    }
}
