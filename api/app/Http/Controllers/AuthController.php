<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyRequest;
use App\Http\Resources\UserResource;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use App\Services\Auth\PendingRegistrationStore;
use App\Services\Auth\SessionService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private readonly PendingRegistrationStore $pending, private readonly SessionService $sessions) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $email = Str::lower(trim($data['email']));
        $raw = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $hash = hash('sha256', $raw);
        if (! User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            $this->pending->put($hash, [
                'email' => $email,
                'password_hash' => Hash::make($data['password']),
                'full_name' => trim($data['full_name']),
                'address' => isset($data['address']) ? trim($data['address']) : '',
                'tel' => isset($data['tel']) ? trim($data['tel']) : null,
                'language' => $data['language'] ?? 'en',
                'refer_id' => $data['refer_id'] ?? null,
            ]);
            $url = rtrim(config('services.frontend.verify_url', env('FRONTEND_VERIFY_URL')), '?').'?'.http_build_query(['token' => $raw]);
            try {
                Mail::to($email)->send(new VerifyEmailMail($url));
            } catch (Throwable $exception) {
                $this->pending->forget($hash);
                report($exception);

                return response()->json(['error' => ['code' => 'email_delivery_unavailable', 'message' => 'Confirmation email could not be sent.']], 502);
            }
        }

        $payload = ['status' => 'pending'];
        if (app()->environment('local') && isset($url)) {
            $payload['verification_url'] = $url;
        }

        return response()->json($payload, 202);
    }

    public function verify(VerifyRequest $request): JsonResponse
    {
        $hash = hash('sha256', $request->validated('token'));
        $pending = $this->pending->consume($hash);
        if (! $pending) {
            $code = $this->pending->wasUsed($hash) ? 'verification_token_reused' : 'verification_token_invalid';

            return response()->json(['error' => ['code' => $code, 'message' => 'The verification link is invalid or expired.']], $code === 'verification_token_reused' ? 409 : 400);
        }
        try {
            $user = DB::transaction(function () use ($pending): User {
                $user = User::create([
                    'email' => $pending['email'],
                    'password' => $pending['password_hash'],
                    'full_name' => $pending['full_name'],
                    'address' => $pending['address'],
                    'tel' => $pending['tel'],
                    'language' => $pending['language'],
                    'refer_id' => $pending['refer_id'],
                ]);
                $user->forceFill(['email_verified_at' => now(), 'role' => UserRole::User])->save();

                return $user;
            });
        } catch (QueryException) {
            return response()->json(['error' => ['code' => 'duplicate_email', 'message' => 'This email is already registered.']], 409);
        }
        $this->pending->markUsed($hash);

        return $this->sessionResponse($user, $request, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = Str::lower(trim($request->validated('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        $hash = $user?->password ?? config('auth_tokens.dummy_password_hash');
        if (! Hash::check($request->validated('password'), $hash) || ! $user) {
            return response()->json(['error' => ['code' => 'invalid_credentials', 'message' => 'Email or password is incorrect.']], 401);
        }

        return $this->sessionResponse($user, $request);
    }

    public function refresh(Request $request): JsonResponse
    {
        $raw = $request->cookie(config('auth_tokens.cookies.refresh')) ?: $request->input('refresh_token');
        $tokens = is_string($raw) ? $this->sessions->rotate($raw, $request) : null;
        if (! $tokens || isset($tokens['replayed'])) {
            $code = isset($tokens['replayed']) ? 'refresh_token_reused' : 'refresh_token_invalid';

            return $this->sessions->clearCookies(response()->json(['error' => ['code' => $code, 'message' => 'The refresh session is no longer valid.']], 401));
        }

        return $this->sessions->attachCookies(response()->json(['data' => ['authenticated' => true]]), $tokens);
    }

    public function logout(Request $request): JsonResponse
    {
        $raw = $request->cookie(config('auth_tokens.cookies.refresh')) ?: $request->input('refresh_token');
        if (is_string($raw)) {
            $this->sessions->revoke($raw);
        }

        return $this->sessions->clearCookies(response()->json(['data' => ['logged_out' => true]]));
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->sessions->revokeAll($request->user());

        return $this->sessions->clearCookies(response()->json(['data' => ['logged_out' => true]]));
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    private function sessionResponse(User $user, Request $request, int $status = 200): JsonResponse
    {
        $tokens = $this->sessions->create($user, $request);

        return $this->sessions->attachCookies(response()->json(['data' => ['user' => new UserResource($user), 'authenticated' => true]], $status), $tokens);
    }
}
