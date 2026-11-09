<?php

namespace App\Services\Translation;

final class TranslationLocales
{
    /** @return list<string> */
    public static function supported(): array
    {
        return array_values(config('translation.locales', []));
    }

    public static function isSupported(?string $locale): bool
    {
        return $locale !== null && in_array($locale, self::supported(), true);
    }

    public static function defaultSource(): string
    {
        $locale = (string) config('translation.default_source_locale');

        return self::isSupported($locale) ? $locale : (self::supported()[0] ?? 'en');
    }

    /** @return list<string> Every supported locale except the source one. */
    public static function targetsFor(string $sourceLocale): array
    {
        return array_values(array_filter(self::supported(), fn (string $locale) => $locale !== $sourceLocale));
    }

    /** Reduces a BCP 47 tag such as "de-AT" or "en_US" to a supported locale. */
    public static function normalize(?string $tag): ?string
    {
        if (! is_string($tag) || $tag === '') {
            return null;
        }
        $base = strtolower(substr(str_replace('_', '-', trim($tag)), 0, 2));

        return self::isSupported($base) ? $base : null;
    }
}
