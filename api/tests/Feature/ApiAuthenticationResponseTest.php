<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiAuthenticationResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_authentication_exceptions_return_json_instead_of_redirecting(): void
    {
        Route::get('/api/testing/authentication-exception', function (): never {
            throw new AuthenticationException;
        });

        $this->get('/api/testing/authentication-exception', ['Accept' => 'text/html'])
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('error.code', 'unauthenticated')
            ->assertJsonPath('error.message', 'Authentication is required.');
    }

    public function test_protected_api_requests_return_json_401_and_403_responses(): void
    {
        $this->get('/api/users', ['Accept' => 'text/html'])
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('error.code', 'unauthenticated');

        $customer = User::factory()->create();
        $this->withToken($this->accessToken($customer))
            ->get('/api/users', ['Accept' => 'text/html'])
            ->assertForbidden()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('error.code', 'forbidden');
    }

    public function test_api_options_preflight_is_handled_by_cors_before_authentication(): void
    {
        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Access-Control-Request-Method' => 'PATCH',
            'Access-Control-Request-Headers' => 'content-type',
        ])
            ->options('/api/users/1/password')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
