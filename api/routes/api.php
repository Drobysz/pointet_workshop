<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoodController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PreorderController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\SellerApplicationController;
use App\Http\Controllers\SendcloudWebhookController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/account/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/account/verify', [AuthController::class, 'verify'])->middleware('throttle:email-verify');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('throttle:refresh');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('throttle:api-write');
Route::post('/webhooks/sendcloud', SendcloudWebhookController::class);
Route::post('/webhooks/stripe', [StripeController::class, 'webhook']);
Route::post('/seller/requests', [SellerApplicationController::class, 'store'])->middleware('throttle:seller-application');
Route::post('/basket/validate', [BasketController::class, 'validateGuest'])->middleware('throttle:api-write');
Route::post('/preorders', [PreorderController::class, 'store'])->middleware(['auth.optional', 'throttle:api-write']);
Route::get('/stripe/checkout-sessions/{sessionId}', [StripeController::class, 'checkoutSession'])
    ->where('sessionId', 'cs_[A-Za-z0-9_]+')
    ->middleware(['auth.optional', 'throttle:api-read']);

Route::middleware('throttle:api-read')->group(function (): void {
    Route::get('/goods', [GoodController::class, 'index']);
    Route::get('/goods/{good}', [GoodController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/subcategories', [SubcategoryController::class, 'index']);
    Route::get('/colors', [ColorController::class, 'index']);
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::get('/orders/guest', [OrderController::class, 'guestIndex']);
    Route::get('/orders/guest/{orderId}', [OrderController::class, 'guestShow'])->whereNumber('orderId');
    Route::get('/preorders/guest', [PreorderController::class, 'guestIndex']);
    Route::get('/preorders/guest/{preorderId}', [PreorderController::class, 'guestShow'])->whereNumber('preorderId');
});

Route::middleware('auth.jwt')->group(function (): void {
    Route::patch('/users/{user}/email', [UserController::class, 'requestEmailChange'])->middleware('throttle:email-change');
    Route::post('/users/{user}/email/verify', [UserController::class, 'verifyEmailChange'])->middleware('throttle:email-verify');
    Route::patch('/users/{user}/password', [UserController::class, 'updatePassword'])->middleware('throttle:password-change');

    Route::middleware('throttle:api-read')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::apiResource('users', UserController::class)->only(['index', 'show']);
        Route::apiResource('basket', BasketController::class)
            ->only(['index'])
            ->parameters(['basket' => 'basket']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
        Route::apiResource('preorders', PreorderController::class)->only(['index', 'show']);
    });

    Route::middleware('throttle:api-write')->group(function (): void {
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::delete('/basket', [BasketController::class, 'clear']);
        Route::apiResource('users', UserController::class)->only(['update', 'destroy']);
        Route::apiResource('basket', BasketController::class)
            ->only(['store', 'update', 'destroy'])
            ->parameters(['basket' => 'basket']);
        Route::apiResource('orders', OrderController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('preorders', PreorderController::class)->only(['update', 'destroy']);
    });

    Route::middleware('admin.current')->group(function (): void {
        Route::middleware('throttle:api-read')->group(function (): void {
            Route::get('/admins/{admin}', [AdminController::class, 'show']);
            Route::get('/admin/goods', [GoodController::class, 'adminIndex']);
            Route::get('/admin/goods/{good}', [GoodController::class, 'adminShow']);
            Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
            Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);
            Route::get('/dashboard/top-products', [DashboardController::class, 'topProducts']);
            Route::get('/dashboard/latest-orders', [DashboardController::class, 'latestOrders']);
            Route::get('/goods/{good}/statistics', [DashboardController::class, 'product']);
            Route::get('/preorder/analytics', [PreorderController::class, 'analytics']);
            Route::get('/seller/requests', [SellerApplicationController::class, 'index']);
            Route::get('/seller/requests/{sellerApplication}', [SellerApplicationController::class, 'show']);
        });

        Route::middleware('throttle:api-write')->group(function (): void {
            Route::post('/users', [UserController::class, 'store']);

            Route::post('/goods', [GoodController::class, 'store']);
            Route::post('/goods/{good}/inventory/{register}/restock', [InventoryController::class, 'restock']);
            Route::put('/goods/{good}', [GoodController::class, 'update']);
            Route::delete('/goods/{good}', [GoodController::class, 'destroy']);
            Route::post('/goods/{good}/images', [ProductImageController::class, 'store']);
            Route::patch('/images/{image}', [ProductImageController::class, 'update']);
            Route::delete('/images/{image}', [ProductImageController::class, 'destroy']);

            Route::post('/admins', [AdminController::class, 'store']);
            Route::post('/seller/requests/{sellerApplication}/response', [SellerApplicationController::class, 'respond']);

            Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('subcategories', SubcategoryController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('colors', ColorController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('materials', MaterialController::class)->only(['store', 'update', 'destroy']);
        });
    });
});
