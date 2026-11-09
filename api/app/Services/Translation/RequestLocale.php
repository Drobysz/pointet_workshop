<?php

namespace App\Services\Translation;

use Illuminate\Http\Request;

/**
 * Resolves the locale a client asked catalog labels to be returned in.
 * An explicit `locale` query parameter wins over the Accept-Language header.
 */
final class RequestLocale
{
    public const ATTRIBUTE = 'translation.locale';

    public const INCLUDE_TRANSLATIONS = 'translation.include';

    public function resolve(Request $request): ?string
    {
        $explicit = $request->query('locale');
        if (is_string($explicit) && TranslationLocales::isSupported($explicit)) {
            return $explicit;
        }

        foreach ($request->getLanguages() as $tag) {
            if ($locale = TranslationLocales::normalize($tag)) {
                return $locale;
            }
        }

        return null;
    }

    /** The locale resolved by the middleware for the current request, if any. */
    public static function current(Request $request): ?string
    {
        $locale = $request->attributes->get(self::ATTRIBUTE);

        return is_string($locale) ? $locale : null;
    }

    public static function includesTranslations(Request $request): bool
    {
        return (bool) $request->attributes->get(self::INCLUDE_TRANSLATIONS, false)
            || $request->boolean('include_translations');
    }
}
