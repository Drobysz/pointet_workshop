<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTrustedOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethodSafe() || $request->bearerToken()) {
            return $next($request);
        }
        $origin = $request->headers->get('Origin');
        $allowed = config('cors.allowed_origins', []);
        if ($origin !== null && ! in_array($origin, $allowed, true)) {
            return response()->json(['error' => ['code' => 'untrusted_origin', 'message' => 'The request origin is not allowed.']], 403);
        }

        return $next($request);
    }
}
