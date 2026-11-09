<?php

namespace App\Models\Concerns;

use App\Models\GoodTranslation;
use App\Services\Translation\TranslationLocales;
use App\Services\Translation\TranslationState;
use App\Services\Translation\TranslationSync;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

/**
 * Product labels stored in `good_translations`. Only the fields listed in
 * `translation.goods.fields` are localized; descriptions stay untouched.
 *
 * @mixin Model
 */
trait HasGoodTranslations
{
    public static function bootHasGoodTranslations(): void
    {
        static::creating(function (Model $model): void {
            $model->source_locale ??= TranslationLocales::defaultSource();
        });
        static::saved(fn (Model $model) => TranslationSync::afterSave($model));
    }

    public function translations(): HasMany
    {
        return $this->hasMany(GoodTranslation::class);
    }

    public function translatableFields(): array
    {
        return array_values(config('translation.goods.fields', ['name']));
    }

    public function translationSourceLocale(): string
    {
        return TranslationLocales::isSupported($this->source_locale)
            ? $this->source_locale
            : TranslationLocales::defaultSource();
    }

    public function translationFor(string $field, string $locale): ?TranslationState
    {
        $row = $this->translationRows()->first(fn (GoodTranslation $row) => $row->locale === $locale);
        $value = $row?->getAttribute($field);
        if ($value === null || $value === '') {
            return null;
        }

        return new TranslationState(
            (string) $value,
            (bool) $row->getAttribute("{$field}_is_manual"),
            $row->getAttribute("{$field}_source_hash"),
        );
    }

    public function storeTranslation(string $field, string $locale, string $value, string $sourceHash, bool $isManual): void
    {
        $this->translations()->updateOrCreate(
            ['locale' => $locale],
            [$field => $value, "{$field}_source_hash" => $sourceHash, "{$field}_is_manual" => $isManual],
        );
        $this->unsetRelation('translations');
    }

    public function forgetTranslation(string $field, string $locale): void
    {
        $row = $this->translations()->where('locale', $locale)->first();
        if (! $row) {
            return;
        }
        $row->forceFill([$field => null, "{$field}_source_hash" => null, "{$field}_is_manual" => false]);
        $hasContent = collect(['name', 'description', 'short_description', 'meta_title', 'meta_description'])
            ->contains(fn (string $column) => $row->getAttribute($column) !== null);
        $hasContent ? $row->save() : $row->delete();
        $this->unsetRelation('translations');
    }

    public function translate(string $field, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();
        $original = (string) $this->getAttribute($field);
        if ($locale === $this->translationSourceLocale()) {
            return $original;
        }

        return $this->translationFor($field, $locale)?->value ?? $original;
    }

    /** @return Collection<int, GoodTranslation> */
    private function translationRows(): Collection
    {
        if (! $this->relationLoaded('translations')) {
            $this->load('translations');
        }

        return $this->getRelation('translations');
    }
}
