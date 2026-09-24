<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\Good;
use App\Models\GoodRegister;
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

        if (! $request->user()->isAdmin()) {
            return OrderResource::collection($query->latest('placed_at')->get());
        }

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
            $ids = array_column($data['items'], 'good_register_id');
            $goodIds = GoodRegister::whereIn('id', $ids)->pluck('good_id')->unique()->sort()->values();
            // Every stock writer locks products first in ID order, then inventory rows.
            $goods = Good::whereIn('id', $goodIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $order = Order::create(['user_id' => $user->id, 'customer_name' => $user->full_name, 'customer_email' => $user->email, 'status' => OrderStatus::Processing, 'placed_at' => now()]);
            foreach ($data['items'] as $line) {
                $variant = GoodRegister::with('color')->lockForUpdate()->findOrFail($line['good_register_id']);
                $good = $goods->get($variant->good_id);
                abort_unless($good, 422, 'This inventory selection is no longer available.');
                abort_if($line['quantity'] > $variant->quantity, 422, "Insufficient inventory for {$good->name} in the selected color and size.");
                $order->items()->create(['good_id' => $good->id, 'good_register_id' => $variant->id, 'product_name' => $good->name, 'color_name' => $variant->color->name, 'size' => $variant->size, 'unit_price' => $good->price, 'quantity' => $line['quantity'], 'status' => OrderStatus::Processing]);
                $variant->decrement('quantity', $line['quantity']);
            }
            foreach ($goods as $good) {
                $good->forceFill(['current_quantity' => $good->inventory()->sum('quantity'), 'inventory_version' => $good->inventory_version + 1])->save();
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
