<?php

return [
    'issuer' => env('AUTH_JWT_ISSUER', env('APP_URL')),
    'audience' => env('AUTH_JWT_AUDIENCE', env('ADMIN_URL', 'http://localhost:3000')),
    'access_ttl_minutes' => (int) env('AUTH_ACCESS_TTL_MINUTES', 15),
    'refresh_ttl_days' => (int) env('AUTH_REFRESH_TTL_DAYS', 30),
    'pending_ttl_hours' => (int) env('AUTH_PENDING_TTL_HOURS', 24),
    'pending_store' => env('AUTH_PENDING_STORE', 'redis'),
    'private_key' => env('AUTH_JWT_PRIVATE_KEY'),
    'private_key_path' => env('AUTH_JWT_PRIVATE_KEY_PATH'),
    'public_key' => env('AUTH_JWT_PUBLIC_KEY'),
    'public_key_path' => env('AUTH_JWT_PUBLIC_KEY_PATH'),
    'key_id' => env('AUTH_JWT_KEY_ID', 'primary'),
    'dummy_password_hash' => env('AUTH_DUMMY_PASSWORD_HASH', '$2y$12$w5Yg6HXS4wGQbrLwxVaOgOXg6Zl7k2MZ4d5d7bZk5YH5Bqg.fR1ly'),
    'cookies' => [
        'access' => env('AUTH_ACCESS_COOKIE', 'access_token'),
        'refresh' => env('AUTH_REFRESH_COOKIE', 'refresh_token'),
        'secure' => filter_var(env('SESSION_SECURE_COOKIE', true), FILTER_VALIDATE_BOOL),
        'same_site' => env('AUTH_COOKIE_SAME_SITE', 'lax'),
        'domain' => env('SESSION_DOMAIN'),
    ],
];
