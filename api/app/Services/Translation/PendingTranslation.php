<?php

namespace App\Services\Translation;

use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Model;

final class PendingTranslation
{
    public function __construct(
        public readonly Model&Translatable $model,
        public readonly string $field,
        public readonly string $sourceLocale,
        public readonly string $targetLocale,
        public readonly string $text,
        public readonly string $sourceHash,
    ) {}
}
