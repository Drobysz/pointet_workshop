<?php

namespace App\Jobs;

use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\Contracts\Translatable;
use App\Services\Translation\Exceptions\TranslationFailed;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Translates the short labels of one catalog record. The job recomputes
 * what is still missing when it runs, so re-dispatching it never repeats
 * a request for an existing translation.
 */
class TranslateCatalogEntry implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 600];

    public int $timeout = 120;

    public int $uniqueFor = 60;

    public function __construct(
        public readonly string $modelType,
        public readonly int $modelId,
        public readonly bool $force = false,
    ) {
        $this->onQueue(config('translation.queue'));
    }

    public function uniqueId(): string
    {
        return "{$this->modelType}:{$this->modelId}";
    }

    public function handle(CatalogTranslator $translator): void
    {
        $class = Relation::getMorphedModel($this->modelType) ?? $this->modelType;
        if (! is_subclass_of($class, Model::class) || ! is_subclass_of($class, Translatable::class)) {
            return;
        }
        $model = $class::query()->find($this->modelId);
        if (! $model) {
            return;
        }

        try {
            $translator->translate([$model], $this->force);
        } catch (TranslationFailed $exception) {
            if (! $exception->retryable) {
                Log::error('Automatic translation failed permanently.', [
                    'model' => $this->uniqueId(),
                    'message' => $exception->getMessage(),
                ]);

                return;
            }
            throw $exception;
        }
    }
}
