<?php

return [
    'mode' => env('CHECKOUT_MODE', 'preorder'),
    // This is deliberately not environment-configurable: the demand-validation payment is always €1.
    'preorder_amount_cents' => 100,
    'currency' => 'eur',
    'success_url' => env('STRIPE_CHECKOUT_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:3000').'/success?session_id={CHECKOUT_SESSION_ID}'),
    'cancel_url' => env('STRIPE_CHECKOUT_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:3000').'/profile/basket?preorder=cancelled'),
];
