<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailChangeMail;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApiRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_read_and_write_endpoints_advertise_the_configured_limits(): void
    {
        $this->getJson('/api/goods')
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', '300');

        $this->postJson('/api/auth/logout')
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', '120');
    }

    public function test_authenticated_users_have_independent_regular_read_limits(): void
    {
        config()->set('rate_limits.api_get', 1);
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->withToken($this->accessToken($first))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', '1');
        $this->withToken($this->accessToken($second))
            ->getJson('/api/auth/me')
            ->assertOk();
        $this->withToken($this->accessToken($first))
            ->getJson('/api/auth/me')
            ->assertTooManyRequests();
    }

    public function test_unauthenticated_regular_requests_fall_back_to_the_ip_limit(): void
    {
        config()->set('rate_limits.api_get', 1);

        $this->getJson('/api/goods')->assertOk();
        $this->getJson('/api/goods')
            ->assertTooManyRequests()
            ->assertHeader('X-RateLimit-Limit', '1')
            ->assertHeader('X-RateLimit-Remaining', '0')
            ->assertHeader('Retry-After')
            ->assertJsonPath('error.code', 'request_failed');
    }

    public function test_regular_write_requests_use_their_own_limit_and_return_json_when_exceeded(): void
    {
        config()->set('rate_limits.api_write', 1);

        $this->postJson('/api/auth/logout')->assertOk();
        $this->postJson('/api/auth/logout')
            ->assertTooManyRequests()
            ->assertHeader('X-RateLimit-Limit', '1')
            ->assertHeader('Retry-After')
            ->assertJsonPath('error.code', 'request_failed');
    }

    public function test_security_sensitive_endpoints_advertise_their_dedicated_limits(): void
    {
        Mail::fake();
        $user = User::factory()->create(['password' => Hash::make('CurrentPassword123!')]);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'CurrentPassword123!'])
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', '10');

        $this->postJson('/api/account/register', [
            'email' => 'registration@example.test',
            'password' => 'Registration123!',
            'full_name' => 'Registration Customer',
        ])
            ->assertAccepted()
            ->assertHeader('X-RateLimit-Limit', '10');

        $verificationUrl = null;
        Mail::assertSent(VerifyEmailMail::class, function (VerifyEmailMail $mail) use (&$verificationUrl): bool {
            $verificationUrl = $mail->verificationUrl;

            return true;
        });
        parse_str((string) parse_url((string) $verificationUrl, PHP_URL_QUERY), $query);
        $this->postJson('/api/account/verify', ['token' => $query['token']])
            ->assertCreated()
            ->assertHeader('X-RateLimit-Limit', '10');

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/password", [
                'current_password' => 'CurrentPassword123!',
                'new_password' => 'ReplacementPassword123!',
            ])
            ->assertOk()
            ->assertHeader('X-RateLimit-Limit', '10');

        $this->withToken($this->accessToken($user))
            ->patchJson("/api/users/{$user->id}/email", ['email' => 'changed@example.test'])
            ->assertAccepted()
            ->assertHeader('X-RateLimit-Limit', '10');
        Mail::assertSent(VerifyEmailChangeMail::class);

        $this->postJson('/api/auth/refresh')
            ->assertUnauthorized()
            ->assertHeader('X-RateLimit-Limit', '60');
    }
}
