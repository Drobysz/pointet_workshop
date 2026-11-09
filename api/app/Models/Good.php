<?php

namespace App\Models;

use App\Models\Concerns\HasGoodTranslations;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Good extends Model implements Translatable
{
    use HasFactory, HasGoodTranslations;

    protected $attributes = [
        'weigh' => 0,
    ];

    protected $fillable = [
        'name',
        'brand',
        'category_id',
        'subcategory_id',
        'price',
        'weigh',
        'current_quantity',
        'description',
        'visible',
        'source_locale',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'weigh' => 'integer',
            'current_quantity' => 'integer',
            'inventory_version' => 'integer',
            'visible' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function colors(): BelongsToMany
    {
        return $this->belongsToMany(Color::class, 'good_register')->distinct();
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(GoodRegister::class)->orderBy('id');
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeCatalogFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['category_id'] ?? null, fn (Builder $q, int|string $id) => $q->where('category_id', $id))
            ->when($filters['subcategory_id'] ?? null, fn (Builder $q, int|string $id) => $q->where('subcategory_id', $id))
            ->when(isset($filters['min_price']), fn (Builder $q) => $q->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn (Builder $q) => $q->where('price', '<=', $filters['max_price']))
            ->when($filters['search'] ?? null, function (Builder $q, string $search): void {
                $phrase = mb_strtolower(trim($search));
                $locale = app()->getLocale();
                $q->where(fn (Builder $inner) => $inner
                    ->whereRaw('LOWER(name) LIKE ?', ["%{$phrase}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$phrase}%"])
                    // Visitors search in their own language: translated names match too.
                    ->orWhereHas('translations', fn (Builder $translation) => $translation
                        ->where('locale', $locale)
                        ->whereRaw('LOWER(name) LIKE ?', ["%{$phrase}%"])));
            });
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('visible', true);
    }
}
