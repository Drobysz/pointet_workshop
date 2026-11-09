<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Material;
use App\Models\Subcategory;
use App\Services\Auth\AccessTokenService;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\Contracts\TranslationProvider;
use App\Services\Translation\Providers\DeepLTranslationProvider;
use App\Services\Translation\Providers\NullTranslationProvider;
use App\Services\Translation\TranslationUsageTracker;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
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
        $this->app->singleton(TranslationProvider::class, function (): TranslationProvider {
            $key = (string) config('translation.deepl.api_key');

            return match (config('translation.provider')) {
                'deepl' => $key !== ''
                    ? new DeepLTranslationProvider($key, config('translation.deepl.api_url') ?: null, (int) config('translation.deepl.timeout', 15))
                    : new NullTranslationProvider,
                default => new NullTranslationProvider,
            };
        });
        $this->app->singleton(TranslationUsageTracker::class, fn (): TranslationUsageTracker => new TranslationUsageTracker(
            (string) config('translation.provider', 'deepl'),
            ((int) config('translation.deepl.monthly_character_limit')) > 0 ? (int) config('translation.deepl.monthly_character_limit') : null,
        ));
        $this->app->singleton(CatalogTranslator::class, fn ($app): CatalogTranslator => new CatalogTranslator(
            $app->make(TranslationProvider::class),
            $app->make(TranslationUsageTracker::class),
            (int) config('translation.batch_size', 50),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::morphMap([
            'good' => Good::class,
            'category' => Category::class,
            'subcategory' => Subcategory::class,
            'color' => Color::class,
            'material' => Material::class,
        ]);
        RateLimiter::for('api-read', fn (Request $request) => Limit::perMinute(
            $this->attempts('api_get'),
        )->by($this->clientKey($request)));
        RateLimiter::for('api-write', fn (Request $request) => Limit::perMinute(
            $this->attempts('api_write'),
        )->by($this->clientKey($request)));
        RateLimiter::for('register', fn (Request $request) => Limit::perMinute(
            $this->attempts('register'),
        )->by('register:'.Str::lower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(
            $this->attempts('login'),
        )->by('login:'.Str::lower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('refresh', fn (Request $request) => Limit::perMinute(
            $this->attempts('refresh'),
        )->by('refresh:'.$request->ip()));
        RateLimiter::for('email-change', fn (Request $request) => Limit::perMinutes(
            15,
            $this->attempts('email_change'),
        )->by('email-change:'.$this->clientKey($request)));
        RateLimiter::for('email-verify', fn (Request $request) => Limit::perMinute(
            $this->attempts('email_verify'),
        )->by('email-verify:'.$this->clientKey($request)));
        RateLimiter::for('password-change', fn (Request $request) => Limit::perMinute(
            $this->attempts('password_change'),
        )->by('password-change:'.$this->clientKey($request)));
        RateLimiter::for('seller-application', fn (Request $request) => Limit::perMinutes(15, 3)
            ->by('seller-application:'.Str::lower((string) $request->input('email')).'|'.$request->ip()));
    }

    private function attempts(string $limiter): int
    {
        $attempts = max(1, (int) config("rate_limits.{$limiter}"));

        return app()->environment('local')
            ? $attempts * (int) config('rate_limits.local_multiplier')
            : $attempts;
    }

    private function clientKey(Request $request): string
    {
        $token = $request->cookie(config('auth_tokens.cookies.access')) ?: $request->bearerToken();

        if (is_string($token) && $token !== '') {
            try {
                return 'user:'.app(AccessTokenService::class)->userId($token);
            } catch (\Throwable) {
                // Invalid tokens are handled by the authentication middleware and share the IP limit.
            }
        }

        return 'ip:'.$request->ip();
    }
}
