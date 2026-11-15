<?php

return [
    'mode' => env('CHECKOUT_MODE', 'standard'),
    // This is deliberately not environment-configurable: the demand-validation payment is always €1.
    'preorder_amount_cents' => 100,
    'currency' => 'eur',
    // Goods ship from their sellers, so delivery is charged once per distinct brand in the basket (EUR 15).
    'delivery_fee_per_brand_cents' => 1500,
    'success_url' => env('STRIPE_CHECKOUT_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:3000').'/success?session_id={CHECKOUT_SESSION_ID}'),
    'cancel_url' => env('STRIPE_CHECKOUT_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:3000').'/profile/basket?preorder=cancelled'),
    'order_cancel_url' => env('STRIPE_ORDER_CHECKOUT_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:3000').'/profile/basket?order=cancelled'),
];
