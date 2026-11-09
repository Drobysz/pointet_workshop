<?php

namespace App\Services\Translation\Contracts;

use App\Services\Translation\TranslationState;

/**
 * Implemented by Eloquent models whose short labels are localized.
 */
interface Translatable
{
    /** @return list<string> Attribute names translated into every supported locale. */
    public function translatableFields(): array;

    public function translationSourceLocale(): string;

    public function translationFor(string $field, string $locale): ?TranslationState;

    public function storeTranslation(string $field, string $locale, string $value, string $sourceHash, bool $isManual): void;

    public function forgetTranslation(string $field, string $locale): void;

    /** The attribute value in the source locale, or its translation into $locale when one exists. */
    public function translate(string $field, ?string $locale = null): string;
}
