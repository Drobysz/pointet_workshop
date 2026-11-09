<?php

use App\Jobs\DeliverTransactionalEmail;
use App\Models\TransactionalEmail;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('transactional-mail:dispatch', function () {
    TransactionalEmail::query()->where('available_at', '<=', now())
        ->select('id')->chunkById(100, function ($emails): void {
            foreach ($emails as $email) {
                DeliverTransactionalEmail::dispatch($email->id);
            }
        });
})->purpose('Queue due transactional emails from the outbox');

Artisan::command('transactional-mail:retry {id}', function () {
    $updated = TransactionalEmail::query()->whereKey($this->argument('id'))
        ->whereNull('sent_at')->whereNull('available_at')->whereNotNull('payload')
        ->update(['attempts' => 0, 'available_at' => now()]);

    return $updated ? 0 : 1;
})->purpose('Make an exhausted transactional email eligible for delivery again');

Schedule::command('transactional-mail:dispatch')->everyMinute()->withoutOverlapping(5);
// Picks up labels left untranslated by a failed job or an exhausted monthly quota.
Schedule::command('translations:sync')->dailyAt('03:00')->withoutOverlapping(60);
