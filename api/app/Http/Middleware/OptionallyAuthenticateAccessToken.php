<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Auth\AccessTokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/** Adds a valid user to the request but deliberately leaves guest requests anonymous. */
class OptionallyAuthenticateAccessToken
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
        if ($user) {
            Auth::setUser($user);
            $request->setUserResolver(fn () => $user);
        }

        return $next($request);
    }
}
