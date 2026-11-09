<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Material;
use App\Models\Subcategory;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\Exceptions\TranslationFailed;
use Illuminate\Console\Command;

class SyncTranslations extends Command
{
    protected $signature = 'translations:sync
        {--type=* : Limit to goods, categories, subcategories, colors or materials}
        {--force : Regenerate automatic translations even when they are up to date}';

    protected $description = 'Translate catalog labels that have no up-to-date translation yet, in batches';

    private const TYPES = [
        'goods' => Good::class,
        'categories' => Category::class,
        'subcategories' => Subcategory::class,
        'colors' => Color::class,
        'materials' => Material::class,
    ];

    public function handle(CatalogTranslator $translator): int
    {
        $types = $this->option('type') ?: array_keys(self::TYPES);
        $force = (bool) $this->option('force');
        $totals = ['requested' => 0, 'reused' => 0, 'translated' => 0, 'requests' => 0, 'characters' => 0];

        foreach ($types as $type) {
            $class = self::TYPES[$type] ?? null;
            if (! $class) {
                $this->error("Unknown type: {$type}");

                return self::INVALID;
            }
            $stopped = false;
            $class::query()->with('translations')->chunkById(100, function ($models) use ($translator, $force, &$totals, &$stopped): bool {
                try {
                    $report = $translator->translate($models, $force);
                } catch (TranslationFailed $exception) {
                    $this->error($exception->getMessage());
                    $stopped = true;

                    return false;
                }
                foreach (array_keys($totals) as $key) {
                    $totals[$key] += $report->{$key};
                }
                if ($report->disabled) {
                    $this->warn('Automatic translation is not configured; only existing translations were reused.');
                    $stopped = true;

                    return false;
                }
                if ($report->quotaExhausted) {
                    $this->warn('The translation quota is exhausted; remaining labels stay pending until the next period.');
                    $stopped = true;

                    return false;
                }

                return true;
            });
            if ($stopped) {
                break;
            }
        }

        $this->table(array_keys($totals), [array_values($totals)]);

        return self::SUCCESS;
    }
}
