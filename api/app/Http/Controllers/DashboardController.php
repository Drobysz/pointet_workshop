<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Good;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        return response()->json(['data' => ['users' => User::where('role', 'user')->count(), 'orders' => Order::count(), 'monthly_revenue' => (string) OrderItem::query()->whereHas('order', fn ($q) => $q->whereBetween('placed_at', [now()->startOfMonth(), now()->endOfMonth()]))->selectRaw('COALESCE(SUM(unit_price * quantity), 0) AS total')->value('total')]]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $range = $request->validate(['range' => ['nullable', 'in:week,month,6months,year']])['range'] ?? 'month';
        $start = match ($range) {
            'week' => now()->subDays(6)->startOfDay(), '6months' => now()->subMonths(6)->startOfMonth(), 'year' => now()->subYear()->startOfMonth(), default => now()->subDays(29)->startOfDay()
        };
        $driver = DB::getDriverName();
        $bucket = in_array($range, ['6months', 'year'], true)
            ? ($driver === 'pgsql' ? "to_char(date_trunc('month', orders.placed_at), 'YYYY-MM')" : "strftime('%Y-%m', orders.placed_at)")
            : ($driver === 'pgsql' ? "to_char(date_trunc('day', orders.placed_at), 'YYYY-MM-DD')" : "strftime('%Y-%m-%d', orders.placed_at)");
        $points = OrderItem::query()->join('orders', 'orders.id', '=', 'order_items.order_id')->where('orders.placed_at', '>=', $start)->selectRaw("{$bucket} AS bucket, SUM(order_items.unit_price * order_items.quantity) AS revenue, SUM(order_items.quantity) AS units")->groupByRaw($bucket)->orderByRaw($bucket)->get();

        return response()->json(['data' => $points]);
    }

    public function topProducts(): JsonResponse
    {
        $rows = OrderItem::query()->selectRaw('good_id, product_name, SUM(quantity) AS units, SUM(unit_price * quantity) AS revenue')->groupBy('good_id', 'product_name')->orderByDesc('units')->limit(5)->get();

        return response()->json(['data' => $rows]);
    }

    public function latestOrders()
    {
        return OrderResource::collection(Order::with('items')->latest('placed_at')->limit(7)->get());
    }

    public function product(Good $good): JsonResponse
    {
        $base = $good->orderItems()->selectRaw('COALESCE(SUM(quantity), 0) AS units, COALESCE(SUM(unit_price * quantity), 0) AS revenue, COUNT(DISTINCT order_id) AS orders')->first();

        return response()->json(['data' => $base]);
    }
}
