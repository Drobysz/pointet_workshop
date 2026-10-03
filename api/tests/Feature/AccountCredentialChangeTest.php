<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailChangeMail;
use App\Models\AuthRefreshToken;
use App\Models\EmailChangeVerification;
use App\Models\User;
use App\Services\Auth\SessionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AccountCredentialChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_requesting_and_verifying_an_email_change_updates_the_email_only_after_confirmation(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email' => 'current@example.test']);

        $code = $this->requestEmailChange($user, 'new@example.test');

        $this->assertSame('current@example.test', $user->fresh()->email);
        $verification = EmailChangeVerification::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertSame('new@example.test', $verification->new_email);
        $this->assertSame(hash('sha256', $code), $verification->getRawOriginal('code_hash'));

        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $code])
            ->assertOk()
            ->assertJsonPath('data.email', 'new@example.test');

        $this->assertSame('new@example.test', $user->fresh()->email);
        $this->assertDatabaseMissing('email_change_verifications', ['user_id' => $user->id]);
    }

    public function test_email_change_rejects_invalid_expired_reused_and_duplicate_email_codes(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email' => 'current@example.test']);
        $existing = User::factory()->create(['email' => 'taken@example.test']);

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/email", ['email' => $existing->email])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $code = $this->requestEmailChange($user, 'new@example.test');
        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => '000000'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
        $this->assertSame('current@example.test', $user->fresh()->email);

        EmailChangeVerification::query()->where('user_id', $user->id)->update(['expires_at' => now()->subMinute()]);
        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $code])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->requestEmailChange($user, 'new@example.test');
        $freshCode = '123456';
        EmailChangeVerification::query()->where('user_id', $user->id)->update(['code_hash' => hash('sha256', $freshCode)]);
        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $freshCode])
            ->assertOk();
        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $freshCode])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_other_users_cannot_request_or_verify_an_email_change(): void
    {
        Mail::fake();
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $this->withToken($this->accessToken($other))
            ->patchJson("/api/users/{$owner->id}/email", ['email' => 'new@example.test'])
            ->assertForbidden();

        $code = $this->requestEmailChange($owner, 'new@example.test');
        $this->withToken($this->accessToken($other))
            ->postJson("/api/users/{$owner->id}/email/verify", ['code' => $code])
            ->assertForbidden();
        $this->assertSame($owner->email, $owner->fresh()->email);
    }

    public function test_a_new_email_change_request_replaces_the_previous_code(): void
    {
        Mail::fake();
        $user = User::factory()->create();
        $oldCode = $this->requestEmailChange($user, 'first@example.test');

        $this->requestEmailChange($user, 'second@example.test');
        $replacementCode = $oldCode === '999999' ? '999998' : '999999';
        EmailChangeVerification::query()->where('user_id', $user->id)->update(['code_hash' => hash('sha256', $replacementCode)]);

        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $oldCode])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
        $this->withToken($this->accessToken($user))
            ->postJson("/api/users/{$user->id}/email/verify", ['code' => $replacementCode])
            ->assertOk()
            ->assertJsonPath('data.email', 'second@example.test');
    }

    public function test_password_change_checks_the_current_password_hashes_the_new_password_and_revokes_refresh_sessions(): void
    {
        $user = User::factory()->create(['password' => Hash::make('CurrentPassword123!')]);
        $tokens = app(SessionService::class)->create($user, Request::create('/'));

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/password", [
                'current_password' => 'CurrentPassword123!',
                'new_password' => 'NewPassword123!',
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonMissingPath('data.password');

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
        $this->assertNotNull(AuthRefreshToken::query()->where('token_hash', hash('sha256', $tokens['refresh']))->value('revoked_at'));
    }

    public function test_password_change_rejects_incorrect_or_invalid_credentials_and_other_users(): void
    {
        $user = User::factory()->create(['password' => Hash::make('CurrentPassword123!')]);
        $other = User::factory()->create();

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/password", [
                'current_password' => 'incorrect-password',
                'new_password' => 'NewPassword123!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/password", [
                'current_password' => 'CurrentPassword123!',
                'new_password' => 'passwordonly',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('new_password');

        $this->withToken($this->accessToken($other))
            ->patchJson("/api/users/{$user->id}/password", [
                'current_password' => 'CurrentPassword123!',
                'new_password' => 'NewPassword123!',
            ])
            ->assertForbidden();
    }

    public function test_generic_user_update_prohibits_email_and_password_but_keeps_profile_fields_editable(): void
    {
        $user = User::factory()->create(['email' => 'current@example.test']);

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}", ['email' => 'new@example.test'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
        $this->assertSame('current@example.test', $user->fresh()->email);

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}", ['password' => 'NewPassword123!'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}", ['full_name' => 'Updated Customer'])
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Updated Customer');
    }

    private function requestEmailChange(User $user, string $email): string
    {
        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/email", ['email' => $email])
            ->assertAccepted()
            ->assertJsonPath('data.status', 'pending_verification');

        $code = null;
        Mail::assertSent(VerifyEmailChangeMail::class, function (VerifyEmailChangeMail $mail) use (&$code, $email): bool {
            $code = $mail->verificationCode;

            return $mail->hasTo($email);
        });

        self::assertIsString($code);

        return $code;
    }
}
