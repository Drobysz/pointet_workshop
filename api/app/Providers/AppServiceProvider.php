<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('register', fn (Request $request) => [
            Limit::perHour(10)->by($request->ip()),
            Limit::perHour(4)->by(Str::lower((string) $request->input('email')).'|'.$request->ip()),
        ]);
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)->by(Str::lower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('refresh', fn (Request $request) => Limit::perMinute(30)->by($request->ip()));
        RateLimiter::for('email-change', fn (Request $request) => [
            Limit::perHour(5)->by('email-change-user:'.$request->user()?->id.'|'.$request->ip()),
            Limit::perHour(3)->by('email-change-address:'.Str::lower((string) $request->input('email')).'|'.$request->ip()),
        ]);
        RateLimiter::for('email-change-verify', fn (Request $request) => Limit::perMinute(10)->by('email-change-verify:'.$request->user()?->id.'|'.$request->ip()));
        RateLimiter::for('password-change', fn (Request $request) => Limit::perMinute(5)->by('password-change:'.$request->user()?->id.'|'.$request->ip()));
    }
}
