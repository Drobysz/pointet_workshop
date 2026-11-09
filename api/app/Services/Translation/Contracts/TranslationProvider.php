<?php

namespace App\Services\Translation\Contracts;

use App\Services\Translation\Exceptions\TranslationFailed;
use App\Services\Translation\Exceptions\TranslationQuotaExceeded;

interface TranslationProvider
{
    public function name(): string;

    /**
     * Translates every text from the source locale into the target locale,
     * returning the translations in the same order.
     *
     * @param  list<string>  $texts
     * @return list<string>
     *
     * @throws TranslationQuotaExceeded
     * @throws TranslationFailed
     */
    public function translate(array $texts, string $sourceLocale, string $targetLocale): array;
}
