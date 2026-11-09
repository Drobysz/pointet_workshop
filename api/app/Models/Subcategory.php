<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subcategory extends Model implements Translatable
{
    use HasFactory, HasTranslations;

    protected $fillable = ['category_id', 'name', 'source_locale'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function goods(): HasMany
    {
        return $this->hasMany(Good::class);
    }
}
