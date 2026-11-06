<?php

namespace Tests\Feature;

use App\Mail\TransactionalMail;
use App\Mail\VerifyEmailMail;
use App\Models\AuthRefreshToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthenticationLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_verification_login_refresh_replay_and_logout(): void
    {
        Mail::fake();
        $register = $this->postJson('/api/account/register', ['email' => ' PERSON@Example.COM ', 'password' => 'secure123', 'full_name' => 'Person Name', 'address' => '10 Example Street', 'tel' => '+33 6 12 34 56 78', 'language' => 'fr']);
        $register->assertAccepted()->assertJsonPath('status', 'pending');
        $this->assertDatabaseCount('users', 0);

        $url = null;
        Mail::assertSent(VerifyEmailMail::class, function (VerifyEmailMail $mail) use (&$url): bool {
            $url = $mail->verificationUrl;

            return true;
        });
        $this->assertSame('/home', parse_url((string) $url, PHP_URL_PATH));
        parse_str((string) parse_url((string) $url, PHP_URL_QUERY), $query);
        $this->postJson('/api/account/verify', ['token' => str_repeat('a', 43)])->assertStatus(400);
        $this->assertDatabaseCount('transactional_emails', 0);
        $verify = $this->postJson('/api/account/verify', ['token' => $query['token']]);
        $verify->assertCreated()->assertJsonPath('data.user.email', 'person@example.com')->assertJsonPath('data.user.address', '10 Example Street')->assertJsonPath('data.user.tel', '+33 6 12 34 56 78')->assertJsonPath('data.user.language', 'fr');
        $this->assertDatabaseCount('users', 1);
        $this->postJson('/api/account/verify', ['token' => $query['token']])->assertStatus(409)->assertJsonPath('error.code', 'verification_token_reused');

        $this->assertDatabaseCount('transactional_emails', 1);
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail): bool {
            $mail->assertHasSubject('Bienvenue sur Pointet !');
            $mail->assertSeeInHtml('Bonjour Person Name');

            return $mail->template === 'welcome' && $mail->locale === 'fr' && $mail->hasTo('person@example.com');
        });
        Mail::assertSent(TransactionalMail::class, 1);

        $badKnown = $this->postJson('/api/auth/login', ['email' => 'person@example.com', 'password' => 'wrong123']);
        $badUnknown = $this->postJson('/api/auth/login', ['email' => 'missing@example.com', 'password' => 'wrong123']);
        $badKnown->assertUnauthorized();
        $this->assertSame($badKnown->json('error.code'), $badUnknown->json('error.code'));

        $login = $this->postJson('/api/auth/login', ['email' => 'PERSON@example.com', 'password' => 'secure123'])->assertOk();
        $oldRefresh = $login->getCookie('refresh_token', false)->getValue();
        $rotated = $this->postJson('/api/auth/refresh', ['refresh_token' => $oldRefresh])->assertOk();
        $newRefresh = $rotated->getCookie('refresh_token', false)->getValue();
        $this->assertNotSame($oldRefresh, $newRefresh);
        $this->postJson('/api/auth/refresh', ['refresh_token' => $oldRefresh])->assertUnauthorized()->assertJsonPath('error.code', 'refresh_token_reused');
        $this->assertSame(0, AuthRefreshToken::query()->whereNull('revoked_at')->count());
        $this->postJson('/api/auth/logout', ['refresh_token' => $newRefresh])->assertOk();
    }

    public function test_logout_all_revokes_other_devices(): void
    {
        $user = User::factory()->create(['password' => 'secure123']);
        $first = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secure123']);
        $second = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secure123']);
        $this->assertSame(2, AuthRefreshToken::query()->whereNull('revoked_at')->count());
        $this->withToken($first->getCookie('access_token', false)->getValue())->postJson('/api/auth/logout-all')->assertOk();
        $this->postJson('/api/auth/refresh', ['refresh_token' => $second->getCookie('refresh_token', false)->getValue()])->assertUnauthorized();
    }

    public function test_new_device_requires_another_active_session_and_refresh_never_alerts(): void
    {
        Mail::fake();
        $user = User::factory()->create(['password' => 'secure123', 'language' => 'de', 'full_name' => '<Alex>']);
        $credentials = ['email' => $user->email, 'password' => 'secure123'];
        $first = $this->postJson('/api/auth/login', $credentials)->assertOk();
        $this->assertDatabaseCount('transactional_emails', 0);

        $firstDevice = $first->getCookie('workshop_device', false)->getValue();
        $this->withCredentials()->withUnencryptedCookie('workshop_device', $firstDevice)
            ->postJson('/api/auth/login', $credentials, ['User-Agent' => 'Firefox/148.0'])->assertOk();
        $this->assertDatabaseCount('transactional_emails', 0);

        AuthRefreshToken::query()->where('user_agent', 'Firefox/148.0')->update(['revoked_at' => now()]);
        AuthRefreshToken::query()->whereNull('revoked_at')->update(['expires_at' => now()->subMinute()]);
        $this->withUnencryptedCookie('workshop_device', '');
        $this->postJson('/api/auth/login', $credentials)->assertOk();
        $this->assertDatabaseCount('transactional_emails', 0);

        $agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/149.0.0.0 Safari/537.36';
        $newDevice = $this->postJson('/api/auth/login', $credentials, ['User-Agent' => $agent])->assertOk();
        $deviceCookie = $newDevice->getCookie('workshop_device', false)->getValue();
        $this->withUnencryptedCookie('workshop_device', $deviceCookie)
            ->postJson('/api/auth/login', $credentials, ['User-Agent' => $agent])->assertOk();
        $this->postJson('/api/auth/refresh', [
            'refresh_token' => $newDevice->getCookie('refresh_token', false)->getValue(),
        ])->assertOk();

        $this->assertDatabaseCount('transactional_emails', 1);
        $this->artisan('transactional-mail:dispatch')->assertSuccessful();
        Mail::assertSent(TransactionalMail::class, function (TransactionalMail $mail) use ($user): bool {
            $mail->assertHasSubject('Anmeldung von einem neuen Gerät — Pointet');
            $mail->assertSeeInHtml('Hallo &lt;Alex&gt;', false);
            $mail->assertSeeInText('Chrome');
            $mail->assertSeeInText('macOS');

            return $mail->locale === 'de' && $mail->hasTo($user->email);
        });
        Mail::assertSentCount(1);
    }

    public function test_registration_allows_an_omitted_address(): void
    {
        Mail::fake();

        $this->postJson('/api/account/register', [
            'email' => 'no-address@example.com',
            'password' => 'secure123',
            'full_name' => 'No Address',
        ])->assertAccepted();

        $url = null;
        Mail::assertSent(VerifyEmailMail::class, function (VerifyEmailMail $mail) use (&$url): bool {
            $url = $mail->verificationUrl;

            return true;
        });
        parse_str((string) parse_url((string) $url, PHP_URL_QUERY), $query);

        $this->postJson('/api/account/verify', ['token' => $query['token']])
            ->assertCreated()
            ->assertJsonPath('data.user.address', '');
    }
}
