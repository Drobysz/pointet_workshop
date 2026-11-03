<?php

namespace App\Http\Controllers;

use App\Http\Requests\BasketRequest;
use App\Http\Requests\GuestBasketValidationRequest;
use App\Http\Resources\BasketResource;
use App\Models\Basket;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Services\Checkout\GuestBasketService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BasketController extends Controller
{
    private const RELATIONS = ['good.subcategory', 'good.colors', 'good.inventory', 'good.images', 'color', 'inventory'];

    public function index(Request $request): AnonymousResourceCollection
    {
        return BasketResource::collection($request->user()->basketItems()->with(self::RELATIONS)->get());
    }

    public function validateGuest(GuestBasketValidationRequest $request, GuestBasketService $guestBaskets): AnonymousResourceCollection
    {
        return $guestBaskets->resources($request->validated('items'));
    }

    public function store(BasketRequest $request): BasketResource
    {
        $data = $request->validated();
        $basket = DB::transaction(function () use ($request, $data): Basket {
            $variant = GoodRegister::findOrFail($data['good_register_id']);
            Good::query()->lockForUpdate()->findOrFail($variant->good_id);
            $variant = GoodRegister::findOrFail($variant->id);
            $basket = Basket::query()
                ->where('user_id', $request->user()->id)
                ->where('good_register_id', $variant->id)
                ->lockForUpdate()
                ->first();
            $quantity = ($basket?->quantity ?? 0) + $data['quantity'];

            abort_if($quantity > $variant->quantity, 422, 'The requested quantity exceeds available stock for this product option.');

            if ($basket) {
                $basket->update(['quantity' => $quantity]);

                return $basket;
            }

            return Basket::create([
                'user_id' => $request->user()->id,
                'good_register_id' => $variant->id,
                'good_id' => $variant->good_id,
                'color_id' => $variant->color_id,
                'quantity' => $quantity,
            ]);
        });

        return new BasketResource($basket->load(self::RELATIONS));
    }

    public function update(BasketRequest $request, Basket $basket): BasketResource
    {
        $this->authorize('update', $basket);
        DB::transaction(function () use ($request, $basket): void {
            Good::query()->lockForUpdate()->findOrFail($basket->good_id);
            $basket->refresh();
            $variant = $basket->inventory;
            abort_unless($variant, 422, 'This inventory selection is no longer available. Select a color and size again.');
            abort_if($request->integer('quantity') > $variant->quantity, 422, 'Requested quantity is unavailable for this color and size.');
            $basket->update(['quantity' => $request->integer('quantity')]);
        });

        return new BasketResource($basket->load(self::RELATIONS));
    }

    public function destroy(Basket $basket)
    {
        $this->authorize('delete', $basket);
        $basket->delete();

        return response()->noContent();
    }

    public function clear(Request $request)
    {
        $request->user()->basketItems()->delete();

        return response()->noContent();
    }
}
