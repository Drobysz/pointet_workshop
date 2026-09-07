<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\Color;
use App\Models\Good;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate(['search' => ['nullable', 'string', 'max:120'], 'user_id' => ['nullable', 'integer'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $query = Order::query()->with('items');
        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        } elseif ($data['user_id'] ?? null) {
            $query->where('user_id', $data['user_id']);
        }
        $query->when($data['search'] ?? null, fn ($q, $search) => $q->where(fn ($inner) => $inner->whereRaw('LOWER(customer_name) LIKE ?', ['%'.mb_strtolower($search).'%'])->orWhereRaw('LOWER(customer_email) LIKE ?', ['%'.mb_strtolower($search).'%'])->orWhere('id', ctype_digit($search) ? (int) $search : -1)));

        return OrderResource::collection($query->latest('placed_at')->paginate($data['per_page'] ?? 7)->withQueryString());
    }

    public function show(Order $order): OrderDetailResource
    {
        $this->authorize('view', $order);

        return new OrderDetailResource($order->load(['user', 'items.good']));
    }

    public function store(OrderRequest $request): OrderDetailResource
    {
        $user = $request->user();
        $data = $request->validated();
        $order = DB::transaction(function () use ($data, $user): Order {
            $order = Order::create(['user_id' => $user->id, 'customer_name' => $user->full_name, 'customer_email' => $user->email, 'status' => OrderStatus::Processing, 'placed_at' => now()]);
            foreach ($data['items'] as $line) {
                $good = Good::query()->lockForUpdate()->findOrFail($line['good_id']);
                abort_if($line['quantity'] > $good->current_quantity, 422, "Insufficient inventory for {$good->name}.");
                $color = isset($line['color_id']) ? Color::find($line['color_id']) : null;
                if ($color) {
                    abort_unless($good->colors()->whereKey($color->id)->exists(), 422, 'Color is unavailable for this product.');
                }
                $order->items()->create(['good_id' => $good->id, 'product_name' => $good->name, 'color_name' => $color?->name, 'unit_price' => $good->price, 'quantity' => $line['quantity'], 'status' => OrderStatus::Processing]);
                $good->decrement('current_quantity', $line['quantity']);
            }
            $user->basketItems()->delete();

            return $order;
        }, 3);

        return new OrderDetailResource($order->load(['user', 'items.good']));
    }

    public function update(OrderRequest $request, Order $order): OrderDetailResource
    {
        $this->authorize('update', $order);
        $order->update(['status' => $request->validated('status')]);
        $order->items()->update(['status' => $request->validated('status')]);

        return new OrderDetailResource($order->load(['user', 'items.good']));
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);
        $order->delete();

        return response()->noContent();
    }
}
