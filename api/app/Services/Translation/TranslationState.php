<?php

namespace App\Services\Translation;

final class TranslationState
{
    public function __construct(
        public readonly string $value,
        public readonly bool $isManual,
        public readonly ?string $sourceHash,
    ) {}
}
