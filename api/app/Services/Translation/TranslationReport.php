<?php

namespace App\Services\Translation;

final class TranslationReport
{
    public int $requested = 0;

    public int $reused = 0;

    public int $translated = 0;

    public int $requests = 0;

    public int $characters = 0;

    public bool $quotaExhausted = false;

    public bool $disabled = false;
}
