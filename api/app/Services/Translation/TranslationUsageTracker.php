<?php

namespace App\Services\Translation;

use App\Models\TranslationUsage;
use App\Services\Translation\Exceptions\TranslationQuotaExceeded;

/**
 * Persists the number of characters sent to the provider per calendar month
 * and refuses new requests once the configured plan limit is reached.
 */
class TranslationUsageTracker
{
    public function __construct(
        private readonly string $provider,
        private readonly ?int $characterLimit,
    ) {}

    public function current(): TranslationUsage
    {
        return TranslationUsage::query()->firstOrCreate(
            ['provider' => $this->provider, 'period' => now()->format('Y-m')],
            ['characters' => 0, 'character_limit' => $this->characterLimit],
        );
    }

    public function isExhausted(): bool
    {
        $usage = $this->current();

        return $usage->exhausted_at !== null
            || ($this->characterLimit !== null && $usage->characters >= $this->characterLimit);
    }

    /**
     * Checks that $characters more can be sent this period.
     *
     * @throws TranslationQuotaExceeded
     */
    public function reserve(int $characters): void
    {
        $usage = $this->current();
        if ($usage->exhausted_at !== null) {
            throw new TranslationQuotaExceeded('The translation quota for this period is exhausted.');
        }
        if ($this->characterLimit !== null && $usage->characters + $characters > $this->characterLimit) {
            $this->markExhausted();
            throw new TranslationQuotaExceeded('The translation quota for this period would be exceeded.');
        }
    }

    public function record(int $characters): void
    {
        $this->current()->increment('characters', $characters);
    }

    public function markExhausted(): void
    {
        $this->current()->update(['exhausted_at' => now()]);
    }

    /** @return array<string, mixed> */
    public function status(): array
    {
        $usage = $this->current();

        return [
            'provider' => $this->provider,
            'period' => $usage->period,
            'characters_used' => $usage->characters,
            'character_limit' => $this->characterLimit,
            'exhausted' => $this->isExhausted(),
            'exhausted_at' => $usage->exhausted_at?->toISOString(),
        ];
    }
}
