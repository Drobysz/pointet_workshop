<?php

namespace App\Http\Controllers;

use App\Http\Requests\BasketRequest;
use App\Http\Resources\BasketResource;
use App\Models\Basket;
use App\Models\Good;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BasketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return BasketResource::collection($request->user()->basketItems()->with(['good.subcategory', 'good.colors', 'color'])->paginate(7));
    }

    public function store(BasketRequest $request): BasketResource
    {
        $data = $request->validated();
        $good = Good::findOrFail($data['good_id']);
        abort_if($data['quantity'] > $good->current_quantity, 422, 'Requested quantity is unavailable.');
        if ($data['color_id'] ?? null) {
            abort_unless($good->colors()->whereKey($data['color_id'])->exists(), 422, 'Color is unavailable for this product.');
        }
        $basket = Basket::updateOrCreate(['user_id' => $request->user()->id, 'good_id' => $good->id, 'color_id' => $data['color_id'] ?? null], ['quantity' => $data['quantity']]);

        return new BasketResource($basket->load(['good.subcategory', 'good.colors', 'color']));
    }

    public function update(BasketRequest $request, Basket $basket): BasketResource
    {
        $this->authorize('update', $basket);
        abort_if($request->integer('quantity') > $basket->good->current_quantity, 422, 'Requested quantity is unavailable.');
        $basket->update(['quantity' => $request->integer('quantity')]);

        return new BasketResource($basket->load(['good.subcategory', 'good.colors', 'color']));
    }

    public function destroy(Basket $basket)
    {
        $this->authorize('delete', $basket);
        $basket->delete();

        return response()->noContent();
    }
}
