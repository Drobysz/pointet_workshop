<?php

use App\Http\Middleware\AuthenticateAccessToken;
use App\Http\Middleware\EnsureTrustedOrigin;
use App\Http\Middleware\RequireCurrentAdmin;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [EnsureTrustedOrigin::class]);
        $middleware->alias([
            'auth.jwt' => AuthenticateAccessToken::class,
            'admin.current' => RequireCurrentAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['error' => ['code' => 'forbidden', 'message' => 'You are not allowed to perform this action.']], 403);
            }
        });
        $exceptions->render(function (ModelNotFoundException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['error' => ['code' => 'not_found', 'message' => 'The requested resource was not found.']], 404);
            }
        });
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['error' => ['code' => 'request_failed', 'message' => $exception->getMessage() ?: 'The request could not be completed.']], $exception->getStatusCode());
            }
        });
    })->create();
