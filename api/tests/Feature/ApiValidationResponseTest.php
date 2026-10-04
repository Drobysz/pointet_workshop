<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ApiValidationResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_change_validation_returns_json_without_an_accept_header(): void
    {
        $user = User::factory()->create(['email' => 'current@example.test']);

        $response = $this->apiPatchWithoutAccept(
            "/api/users/{$user->id}/email",
            ['email' => $user->email],
            $user,
        );

        $response
            ->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['email']])
            ->assertHeaderMissing('Location');
    }

    public function test_regular_api_form_request_validation_returns_json_without_an_accept_header(): void
    {
        $user = User::factory()->create();

        $response = $this->apiPatchWithoutAccept(
            "/api/users/{$user->id}",
            ['email' => 'new@example.test'],
            $user,
        );

        $response
            ->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['email']])
            ->assertHeaderMissing('Location');
    }

    public function test_non_api_validation_retains_redirect_behavior_without_an_accept_header(): void
    {
        Route::middleware('web')->post('/validation-response-test', function (Request $request): void {
            $request->validate(['email' => ['required', 'email']]);
        });

        $this->post('/validation-response-test', ['email' => 'invalid'], [
            'Referer' => 'http://localhost/web-form',
        ])->assertRedirect('http://localhost/web-form');
    }

    private function apiPatchWithoutAccept(string $uri, array $data, User $user): TestResponse
    {
        $content = json_encode($data, JSON_THROW_ON_ERROR);

        return $this->call('PATCH', $uri, [], [], [], [
            'CONTENT_LENGTH' => (string) strlen($content),
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$this->accessToken($user),
        ], $content);
    }
}
