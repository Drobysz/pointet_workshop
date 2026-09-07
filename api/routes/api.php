<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoodController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/account/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/account/verify', [AuthController::class, 'verify'])->middleware('throttle:register');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('throttle:refresh');
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::get('/goods', [GoodController::class, 'index']);
Route::get('/goods/{good}', [GoodController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/subcategories', [SubcategoryController::class, 'index']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/materials', [MaterialController::class, 'index']);

Route::middleware('auth.jwt')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
    Route::apiResource('users', UserController::class)
        ->only(['index', 'show', 'update', 'destroy']);
    Route::apiResource('basket', BasketController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['basket' => 'basket']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'store', 'update', 'destroy']);

    Route::middleware('admin.current')->group(function (): void {
        Route::post('/users', [UserController::class, 'store']);

        Route::post('/goods', [GoodController::class, 'store']);
        Route::put('/goods/{good}', [GoodController::class, 'update']);
        Route::delete('/goods/{good}', [GoodController::class, 'destroy']);
        Route::post('/goods/{good}/images', [ProductImageController::class, 'store']);
        Route::patch('/images/{image}', [ProductImageController::class, 'update']);
        Route::delete('/images/{image}', [ProductImageController::class, 'destroy']);

        Route::post('/admins', [AdminController::class, 'store']);
        Route::get('/admins/{admin}', [AdminController::class, 'show']);

        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('subcategories', SubcategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('colors', ColorController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('materials', MaterialController::class)->only(['store', 'update', 'destroy']);

        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);
        Route::get('/dashboard/top-products', [DashboardController::class, 'topProducts']);
        Route::get('/dashboard/latest-orders', [DashboardController::class, 'latestOrders']);
        Route::get('/goods/{good}/statistics', [DashboardController::class, 'product']);
    });
});
