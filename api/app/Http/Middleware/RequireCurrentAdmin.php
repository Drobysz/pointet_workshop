<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireCurrentAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user()?->fresh();
        if (! $user?->isAdmin()) {
            return response()->json(['error' => ['code' => 'forbidden', 'message' => 'Administrator access is required.']], 403);
        }
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
