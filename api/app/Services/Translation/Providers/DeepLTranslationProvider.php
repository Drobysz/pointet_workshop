<?php

namespace App\Services\Translation\Providers;

use App\Services\Translation\Contracts\TranslationProvider;
use App\Services\Translation\Exceptions\TranslationFailed;
use App\Services\Translation\Exceptions\TranslationQuotaExceeded;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class DeepLTranslationProvider implements TranslationProvider
{
    private const FREE_API_URL = 'https://api-free.deepl.com';

    private const PRO_API_URL = 'https://api.deepl.com';

    /** DeepL requires a regional variant for English targets. */
    private const TARGET_CODES = ['en' => 'EN-GB'];

    public function __construct(
        private readonly string $apiKey,
        private readonly ?string $apiUrl = null,
        private readonly int $timeout = 15,
    ) {}

    public function name(): string
    {
        return 'deepl';
    }

    public function translate(array $texts, string $sourceLocale, string $targetLocale): array
    {
        if ($texts === []) {
            return [];
        }

        try {
            $response = Http::withHeaders(['Authorization' => 'DeepL-Auth-Key '.$this->apiKey])
                ->timeout($this->timeout)
                ->acceptJson()
                ->post($this->baseUrl().'/v2/translate', [
                    'text' => array_values($texts),
                    'source_lang' => strtoupper($sourceLocale),
                    'target_lang' => self::TARGET_CODES[$targetLocale] ?? strtoupper($targetLocale),
                    'preserve_formatting' => true,
                ]);
        } catch (ConnectionException $exception) {
            throw new TranslationFailed('DeepL is unreachable: '.$exception->getMessage());
        }

        if ($response->status() === 456) {
            throw new TranslationQuotaExceeded('The DeepL character quota for this period is exhausted.');
        }
        if ($response->status() === 429 || $response->serverError()) {
            throw new TranslationFailed("DeepL responded with HTTP {$response->status()}.");
        }
        if ($response->failed()) {
            // 400/403 point at the request or the key: retrying cannot help.
            throw new TranslationFailed("DeepL rejected the request with HTTP {$response->status()}.", retryable: false);
        }

        $translations = $response->json('translations');
        if (! is_array($translations) || count($translations) !== count($texts)) {
            throw new TranslationFailed('DeepL returned an unexpected number of translations.', retryable: false);
        }

        return array_map(fn (array $item) => (string) ($item['text'] ?? ''), array_values($translations));
    }

    private function baseUrl(): string
    {
        if ($this->apiUrl) {
            return rtrim($this->apiUrl, '/');
        }

        return str_ends_with($this->apiKey, ':fx') ? self::FREE_API_URL : self::PRO_API_URL;
    }
}
