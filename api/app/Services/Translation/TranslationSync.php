<?php

namespace App\Services\Translation;

use App\Jobs\TranslateCatalogEntry;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Model;

/** Queues the background translation of a catalog record. */
final class TranslationSync
{
    public static function afterSave(Model&Translatable $model): void
    {
        $changed = $model->wasRecentlyCreated || $model->wasChanged('source_locale');
        foreach ($model->translatableFields() as $field) {
            $changed = $changed || $model->wasChanged($field);
        }
        if ($changed) {
            self::queue($model);
        }
    }

    public static function queue(Model&Translatable $model, bool $force = false): void
    {
        TranslateCatalogEntry::dispatch($model->getMorphClass(), (int) $model->getKey(), $force)->afterCommit();
    }
}
