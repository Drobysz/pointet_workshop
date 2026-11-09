<?php

namespace App\Services\Translation;

use App\Models\GoodTranslation;
use App\Models\Translation;
use App\Services\Translation\Contracts\Translatable;
use App\Services\Translation\Contracts\TranslationProvider;
use App\Services\Translation\Exceptions\TranslationFailed;
use App\Services\Translation\Exceptions\TranslationQuotaExceeded;
use App\Services\Translation\Providers\NullTranslationProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Decides which catalog labels still need a translation and obtains them
 * from the configured provider with as few requests as possible.
 */
class CatalogTranslator
{
    public function __construct(
        private readonly TranslationProvider $provider,
        private readonly TranslationUsageTracker $usage,
        private readonly int $batchSize,
    ) {}

    public function isEnabled(): bool
    {
        return ! $this->provider instanceof NullTranslationProvider;
    }

    public function usage(): TranslationUsageTracker
    {
        return $this->usage;
    }

    public static function hash(string $sourceLocale, string $text): string
    {
        return hash('sha256', $sourceLocale."\0".trim($text));
    }

    /**
     * Stable identifiers, codes and measurements are not translated:
     * anything without a letter, or an upper-case code containing digits.
     */
    public static function isTranslatableText(string $text): bool
    {
        $text = trim($text);
        if ($text === '' || preg_match('/\p{L}/u', $text) !== 1) {
            return false;
        }

        return preg_match('/^(?=.*\d)[A-Z0-9][A-Z0-9\-_.\/#]*$/', $text) !== 1;
    }

    /**
     * Every (field, target locale) pair of the model without a valid
     * translation. Manual translations are never listed.
     *
     * @return list<PendingTranslation>
     */
    public function pending(Model&Translatable $model, bool $force = false): array
    {
        $source = $model->translationSourceLocale();
        $pending = [];
        foreach ($model->translatableFields() as $field) {
            $text = trim((string) $model->getAttribute($field));
            if (! self::isTranslatableText($text)) {
                continue;
            }
            $hash = self::hash($source, $text);
            foreach (TranslationLocales::targetsFor($source) as $target) {
                $existing = $model->translationFor($field, $target);
                if ($existing?->isManual) {
                    continue;
                }
                if (! $force && $existing && $existing->sourceHash === $hash) {
                    continue;
                }
                $pending[] = new PendingTranslation($model, $field, $source, $target, $text, $hash);
            }
        }

        return $pending;
    }

    /**
     * Fills in the missing translations of the given models.
     *
     * @param  iterable<Model&Translatable>  $models
     *
     * @throws TranslationFailed when the provider fails in a retryable way
     */
    public function translate(iterable $models, bool $force = false): TranslationReport
    {
        $report = new TranslationReport;
        $pending = collect();
        foreach ($models as $model) {
            $pending = $pending->merge($this->pending($model, $force));
        }
        $report->requested = $pending->count();
        if ($pending->isEmpty()) {
            return $report;
        }

        // 1. Identical source text already translated elsewhere is copied, not
        //    requested again. A forced regeneration asks the provider afresh.
        if (! $force) {
            $pending = $this->reuseExisting($pending, $report);
            if ($pending->isEmpty()) {
                return $report;
            }
        }
        if (! $this->isEnabled()) {
            $report->disabled = true;

            return $report;
        }

        // 2. The rest is requested per language pair, de-duplicated and batched.
        foreach ($pending->groupBy(fn (PendingTranslation $item) => $item->sourceLocale.'>'.$item->targetLocale) as $group) {
            /** @var Collection<string, Collection<int, PendingTranslation>> $byHash */
            $byHash = $group->groupBy(fn (PendingTranslation $item) => $item->sourceHash);
            foreach ($byHash->chunk($this->batchSize) as $chunk) {
                if (! $this->translateChunk($chunk, $report)) {
                    return $report;
                }
            }
        }

        return $report;
    }

    /**
     * @param  Collection<int, PendingTranslation>  $pending
     * @return Collection<int, PendingTranslation>
     */
    private function reuseExisting(Collection $pending, TranslationReport $report): Collection
    {
        $known = [];
        foreach ($pending->groupBy(fn (PendingTranslation $item) => $item->targetLocale) as $locale => $items) {
            $hashes = $items->map(fn (PendingTranslation $item) => $item->sourceHash)->unique()->values()->all();
            Translation::query()->where('locale', $locale)->whereIn('source_hash', $hashes)
                ->orderByDesc('is_manual')->get(['source_hash', 'value'])
                ->each(function (Translation $row) use (&$known, $locale): void {
                    $known[$locale][$row->source_hash] ??= $row->value;
                });
            GoodTranslation::query()->where('locale', $locale)->whereIn('name_source_hash', $hashes)
                ->whereNotNull('name')->orderByDesc('name_is_manual')->get(['name_source_hash', 'name'])
                ->each(function (GoodTranslation $row) use (&$known, $locale): void {
                    $known[$locale][$row->name_source_hash] ??= $row->name;
                });
        }

        return $pending->reject(function (PendingTranslation $item) use ($known, $report): bool {
            $value = $known[$item->targetLocale][$item->sourceHash] ?? null;
            if ($value === null) {
                return false;
            }
            $this->store($item, $value);
            $report->reused++;

            return true;
        })->values();
    }

    /**
     * @param  Collection<string, Collection<int, PendingTranslation>>  $chunk  Pending items grouped by source hash.
     * @return bool False when the quota is exhausted and no further request should be made.
     */
    private function translateChunk(Collection $chunk, TranslationReport $report): bool
    {
        /** @var PendingTranslation $first */
        $first = $chunk->first()->first();
        $texts = $chunk->map(fn (Collection $items) => $items->first()->text)->values()->all();
        $characters = array_sum(array_map(fn (string $text) => mb_strlen($text), $texts));

        try {
            $this->usage->reserve($characters);
            $translations = $this->provider->translate($texts, $first->sourceLocale, $first->targetLocale);
        } catch (TranslationQuotaExceeded $exception) {
            $this->usage->markExhausted();
            $report->quotaExhausted = true;
            Log::warning('Automatic translation paused: the provider quota is exhausted.', [
                'provider' => $this->provider->name(),
                'pending' => $report->requested - $report->reused - $report->translated,
            ]);

            return false;
        }
        $this->usage->record($characters);
        $report->requests++;
        $report->characters += $characters;

        foreach (array_values($chunk->all()) as $index => $items) {
            $value = trim($translations[$index] ?? '');
            if ($value === '') {
                continue;
            }
            foreach ($items as $item) {
                $this->store($item, $value);
                $report->translated++;
            }
        }

        return true;
    }

    private function store(PendingTranslation $item, string $value): void
    {
        DB::transaction(fn () => $item->model->storeTranslation(
            $item->field,
            $item->targetLocale,
            $value,
            $item->sourceHash,
            isManual: false,
        ));
    }

    /**
     * Saves or clears translations typed by an administrator.
     *
     * @param  array<string, array<string, string|null>>  $translations  locale => field => value
     * @return bool Whether an automatic translation must be regenerated.
     */
    public function applyManual(Model&Translatable $model, array $translations): bool
    {
        $source = $model->translationSourceLocale();
        $regenerate = false;
        foreach ($translations as $locale => $fields) {
            if ($locale === $source || ! TranslationLocales::isSupported($locale)) {
                continue;
            }
            foreach ((array) $fields as $field => $value) {
                if (! in_array($field, $model->translatableFields(), true)) {
                    continue;
                }
                $value = is_string($value) ? trim($value) : null;
                if ($value === null || $value === '') {
                    if ($model->translationFor($field, $locale)?->isManual) {
                        $model->forgetTranslation($field, $locale);
                        $regenerate = true;
                    }

                    continue;
                }
                $text = trim((string) $model->getAttribute($field));
                $model->storeTranslation($field, $locale, $value, self::hash($source, $text), isManual: true);
            }
        }

        return $regenerate;
    }
}
