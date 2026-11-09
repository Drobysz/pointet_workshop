<?php

namespace App\Models\Concerns;

use App\Models\Translation;
use App\Services\Translation\TranslationLocales;
use App\Services\Translation\TranslationState;
use App\Services\Translation\TranslationSync;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Collection;

/**
 * Short labels stored in the universal `translations` table.
 *
 * @mixin Model
 */
trait HasTranslations
{
    public static function bootHasTranslations(): void
    {
        static::creating(function (Model $model): void {
            $model->source_locale ??= TranslationLocales::defaultSource();
        });
        static::saved(fn (Model $model) => TranslationSync::afterSave($model));
        static::deleted(fn (Model $model) => $model->translations()->delete());
    }

    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function translatableFields(): array
    {
        return ['name'];
    }

    public function translationSourceLocale(): string
    {
        return TranslationLocales::isSupported($this->source_locale)
            ? $this->source_locale
            : TranslationLocales::defaultSource();
    }

    public function translationFor(string $field, string $locale): ?TranslationState
    {
        $row = $this->translationRows()->first(
            fn (Translation $row) => $row->field === $field && $row->locale === $locale,
        );

        return $row ? new TranslationState($row->value, $row->is_manual, $row->source_hash) : null;
    }

    public function storeTranslation(string $field, string $locale, string $value, string $sourceHash, bool $isManual): void
    {
        $this->translations()->updateOrCreate(
            ['field' => $field, 'locale' => $locale],
            ['value' => $value, 'source_hash' => $sourceHash, 'is_manual' => $isManual],
        );
        $this->unsetRelation('translations');
    }

    public function forgetTranslation(string $field, string $locale): void
    {
        $this->translations()->where('field', $field)->where('locale', $locale)->delete();
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

    /** @return Collection<int, Translation> */
    private function translationRows(): Collection
    {
        if (! $this->relationLoaded('translations')) {
            $this->load('translations');
        }

        return $this->getRelation('translations');
    }
}
