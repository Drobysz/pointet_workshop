<?php

namespace App\Http\Requests\Concerns;

use App\Services\Translation\Contracts\Translatable;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationLocales;
use Illuminate\Validation\Rule;

/**
 * Optional `source_locale` and `translations` inputs shared by every
 * catalog form request.
 *
 * `translations` is keyed by locale: `{"de": {"name": "Lederjacke"}}` saves a
 * manual translation, `{"de": {"name": null}}` clears a manual one so the
 * automatic translation is regenerated. Locales absent from the payload are
 * left untouched.
 */
trait ValidatesTranslations
{
    /**
     * @param  list<string>  $fields
     * @return array<string, array<int, mixed>>
     */
    protected function translationRules(array $fields = ['name']): array
    {
        $rules = [
            'source_locale' => ['sometimes', 'nullable', 'string', Rule::in(TranslationLocales::supported())],
            'translations' => ['sometimes', 'array:'.implode(',', TranslationLocales::supported())],
        ];
        foreach (TranslationLocales::supported() as $locale) {
            $rules["translations.{$locale}"] = ['sometimes', 'array:'.implode(',', $fields)];
            foreach ($fields as $field) {
                $rules["translations.{$locale}.{$field}"] = ['nullable', 'string', 'max:255'];
            }
        }

        return $rules;
    }

    /**
     * The explicit override, the stored value of the record being edited,
     * the administrator's interface locale, or the configured default.
     */
    public function sourceLocaleFor(?Translatable $existing): string
    {
        $explicit = $this->validated('source_locale');
        if (is_string($explicit) && TranslationLocales::isSupported($explicit)) {
            return $explicit;
        }

        return $existing?->translationSourceLocale()
            ?? RequestLocale::current($this)
            ?? TranslationLocales::defaultSource();
    }

    /** @return array<string, array<string, string|null>> */
    public function manualTranslations(): array
    {
        $translations = $this->validated('translations');

        return is_array($translations) ? $translations : [];
    }

    /** Validated attributes without the translation inputs. */
    public function attributesExceptTranslations(): array
    {
        return $this->safe()->except(['source_locale', 'translations']);
    }
}
