<?php

namespace App\Services\Translation\Exceptions;

use RuntimeException;

class TranslationFailed extends RuntimeException
{
    public function __construct(string $message, public readonly bool $retryable = true)
    {
        parent::__construct($message);
    }
}
