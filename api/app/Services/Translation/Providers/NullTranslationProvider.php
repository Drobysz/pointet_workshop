<?php

namespace App\Services\Translation\Providers;

use App\Services\Translation\Contracts\TranslationProvider;
use App\Services\Translation\Exceptions\TranslationFailed;

/** Used when automatic translation is disabled or not configured. */
class NullTranslationProvider implements TranslationProvider
{
    public function name(): string
    {
        return 'null';
    }

    public function translate(array $texts, string $sourceLocale, string $targetLocale): array
    {
        throw new TranslationFailed('Automatic translation is not configured.', retryable: false);
    }
}
