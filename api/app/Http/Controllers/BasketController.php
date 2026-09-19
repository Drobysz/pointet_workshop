<?php

namespace App\Http\Controllers;

use App\Http\Requests\BasketRequest;
use App\Http\Resources\BasketResource;
use App\Models\Basket;
use App\Models\Good;
use App\Models\GoodRegister;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BasketController extends Controller
{
    private const RELATIONS = ['good.subcategory', 'good.colors', 'good.inventory', 'color', 'inventory'];

    public function index(Request $request): AnonymousResourceCollection
    {
        return BasketResource::collection($request->user()->basketItems()->with(self::RELATIONS)->paginate(7));
    }

    public function store(BasketRequest $request): BasketResource
    {
        $data = $request->validated();
        $basket = DB::transaction(function () use ($request, $data): Basket {
            $variant = GoodRegister::findOrFail($data['good_register_id']);
            Good::query()->lockForUpdate()->findOrFail($variant->good_id);
            $variant = GoodRegister::findOrFail($variant->id);
            abort_if($data['quantity'] > $variant->quantity, 422, 'Requested quantity is unavailable for this color and size.');

            return Basket::updateOrCreate(['user_id' => $request->user()->id, 'good_register_id' => $variant->id], ['good_id' => $variant->good_id, 'color_id' => $variant->color_id, 'quantity' => $data['quantity']]);
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
}
