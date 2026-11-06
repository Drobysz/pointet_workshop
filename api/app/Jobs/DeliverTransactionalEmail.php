<?php

namespace App\Jobs;

use App\Mail\TransactionalMail;
use App\Models\TransactionalEmail;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class DeliverTransactionalEmail implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 60;

    public int $uniqueFor = 300;

    public function __construct(public readonly int $emailId)
    {
        $this->onQueue('transactional-mail');
    }

    public function uniqueId(): string
    {
        return (string) $this->emailId;
    }

    public function handle(): void
    {
        DB::transaction(function (): void {
            $email = TransactionalEmail::query()->lockForUpdate()->findOrFail($this->emailId);
            if (! $email->available_at || $email->available_at->isFuture() || $email->sent_at) {
                return;
            }

            try {
                $payload = $email->payload;
                Mail::to($payload['recipient'])->locale($email->locale)
                    ->send(new TransactionalMail($email->template, $payload['data']));
            } catch (Throwable $exception) {
                $attempts = $email->attempts + 1;
                $delay = [1, 5, 15, 60][$attempts - 1] ?? null;
                $email->update([
                    'attempts' => $attempts,
                    'available_at' => $delay ? now()->addMinutes($delay) : null,
                ]);
                Log::error('Transactional email attempt failed.', [
                    'email_id' => $email->id,
                    'attempts' => $attempts,
                    'will_retry' => $delay !== null,
                    'exception_type' => $exception::class,
                ]);

                return;
            }

            $email->update(['sent_at' => now(), 'available_at' => null, 'payload' => null]);
        });
    }
}
