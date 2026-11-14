<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Catalog translation
    |--------------------------------------------------------------------------
    |
    | Short, user-visible catalog labels (product names, categories,
    | subcategories, colors, materials) are translated automatically into
    | every supported locale. Long-form product descriptions are never sent
    | to a translation provider: they stay in their source language.
    |
    */

    'locales' => ['en', 'fr', 'de', 'it', 'ru', 'uk'],

    // Used when neither the request nor the record declares a source locale.
    'default_source_locale' => env('TRANSLATION_DEFAULT_SOURCE_LOCALE', 'en'),

    // Locale of catalog labels returned when a request does not ask for a supported one.
    'fallback_locale' => env('TRANSLATION_FALLBACK_LOCALE', 'en'),

    // "deepl" or "null" (automatic translation disabled; manual translations still work).
    'provider' => env('TRANSLATION_PROVIDER', 'deepl'),

    'queue' => env('TRANSLATION_QUEUE', 'translations'),

    // Maximum number of texts sent to the provider in a single request.
    'batch_size' => max(1, (int) env('TRANSLATION_BATCH_SIZE', 50)),

    'goods' => [
        // Only these product columns are translated. Each one needs the
        // matching `{field}`, `{field}_source_hash` and `{field}_is_manual`
        // columns on good_translations. Descriptions are deliberately absent.
        'fields' => ['name'],
    ],

    'deepl' => [
        'api_key' => env('DEEPL_API_KEY'),
        // Defaults to the Free endpoint for ":fx" keys and the Pro endpoint otherwise.
        'api_url' => env('DEEPL_API_URL'),
        // DeepL API Free allows 500,000 characters per month. 0 disables the local limit.
        'monthly_character_limit' => (int) env('DEEPL_MONTHLY_CHARACTER_LIMIT', 500000),
        'timeout' => (int) env('DEEPL_TIMEOUT', 15),
    ],

];
