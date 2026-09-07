<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Auth\AccessTokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthenticateAccessToken
{
    public function __construct(private readonly AccessTokenService $tokens) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie(config('auth_tokens.cookies.access')) ?: $request->bearerToken();
        try {
            $user = $token ? User::find($this->tokens->userId($token)) : null;
        } catch (Throwable) {
            $user = null;
        }
        if (! $user) {
            return response()->json(['error' => ['code' => 'unauthenticated', 'message' => 'Authentication is required.']], 401);
        }
        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
