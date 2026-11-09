<?php

namespace App\Services\Translation;

use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/** Shapes localized labels and translation metadata for API resources. */
final class Localizer
{
    /**
     * Public responses return the label in the requested locale (falling
     * back to the source text). Administrative responses that include the
     * translation block return the source text, which is what gets edited.
     */
    public static function name(Model&Translatable $model, Request $request, string $field = 'name'): string
    {
        return RequestLocale::includesTranslations($request)
            ? (string) $model->getAttribute($field)
            : $model->translate($field);
    }

    /** @return array<string, mixed> */
    public static function block(Model&Translatable $model, Request $request): array
    {
        if (! RequestLocale::includesTranslations($request)) {
            return [];
        }
        $source = $model->translationSourceLocale();
        $translations = [];
        foreach (TranslationLocales::targetsFor($source) as $locale) {
            $entry = [];
            foreach ($model->translatableFields() as $field) {
                $state = $model->translationFor($field, $locale);
                $text = trim((string) $model->getAttribute($field));
                $entry[$field] = $state?->value;
                $entry["{$field}_is_manual"] = $state?->isManual ?? false;
                $entry["{$field}_is_stale"] = $state !== null && ! $state->isManual
                    && $state->sourceHash !== CatalogTranslator::hash($source, $text);
            }
            $translations[$locale] = $entry;
        }

        return [
            'source_locale' => $source,
            'translatable_fields' => $model->translatableFields(),
            'translations' => $translations,
        ];
    }
}
