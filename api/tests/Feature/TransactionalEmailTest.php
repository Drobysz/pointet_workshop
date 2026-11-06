<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TransactionalEmails;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TransactionalEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_rolling_back_the_business_transaction_discards_the_email(): void
    {
        Mail::fake();
        DB::beginTransaction();
        $user = User::factory()->create();
        app(TransactionalEmails::class)->welcome($user);
        DB::rollBack();

        $this->assertModelMissing($user);
        $this->assertDatabaseCount('transactional_emails', 0);
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        Mail::assertNothingOutgoing();
    }

    public function test_worker_sends_multipart_mail_in_the_stored_locale_with_english_fallback(): void
    {
        $languages = [
            'en' => 'Welcome to Pointet!',
            'fr' => 'Bienvenue sur Pointet !',
            'de' => 'Willkommen bei Pointet!',
            'it' => 'Benvenuto su Pointet!',
            'ru' => 'Добро пожаловать в Pointet!',
        ];
        foreach (array_keys($languages) as $language) {
            $user = User::factory()->create(['language' => $language, 'full_name' => '<Alex>']);
            app(TransactionalEmails::class)->welcome($user);
        }
        $user = User::factory()->create();
        $user->language = 'unsupported';
        app(TransactionalEmails::class)->welcome($user);

        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        $messages = Mail::mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(6, $messages);

        foreach ([...array_values($languages), $languages['en']] as $index => $subject) {
            $email = $messages[$index]->getOriginalMessage();
            $this->assertSame($subject, $email->getSubject());
            $mime = $email->toString();
            $this->assertStringContainsString('multipart/alternative', $mime);
            $this->assertStringContainsString('multipart/related', $mime);
            $this->assertStringContainsString('Content-Type: image/png', $mime);
            $this->assertStringContainsString('background-color:#ffa2a2', $email->getHtmlBody());
            $this->assertStringContainsString('alt="Pointet"', $email->getHtmlBody());
            if ($index < count($languages)) {
                $this->assertStringContainsString('&lt;Alex&gt;', $email->getHtmlBody());
                $this->assertStringContainsString('<Alex>', $email->getTextBody());
            }
        }
        $this->assertDatabaseCount('transactional_emails', 6);
        $this->assertDatabaseMissing('transactional_emails', ['sent_at' => null]);
    }
}
