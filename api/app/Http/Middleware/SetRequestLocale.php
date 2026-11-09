<?php

namespace App\Http\Middleware;

use App\Services\Translation\RequestLocale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetRequestLocale
{
    public function __construct(private readonly RequestLocale $locales) {}

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->locales->resolve($request);
        $request->attributes->set(RequestLocale::ATTRIBUTE, $locale);
        // setLocale() rewrites app.locale, so the fallback must come from a setting it never touches.
        app()->setLocale($locale ?? config('translation.fallback_locale', 'en'));

        return $next($request);
    }
}
