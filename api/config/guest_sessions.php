<?php

return [
    'cookie' => env('GUEST_SESSION_COOKIE', 'guest_token'),
    'ttl_days' => max(1, (int) env('GUEST_SESSION_TTL_DAYS', 365)),
    'domain' => env('GUEST_SESSION_COOKIE_DOMAIN'),
    // Local HTTP development cannot set a Secure cookie. Production must use HTTPS.
    'secure' => env('GUEST_SESSION_COOKIE_SECURE', env('APP_ENV', 'production') !== 'local'),
];
