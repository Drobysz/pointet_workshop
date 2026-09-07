<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoodRequest;
use App\Http\Resources\GoodDetailResource;
use App\Http\Resources\GoodResource;
use App\Models\Good;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GoodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate(['category_id' => ['nullable', 'integer'], 'subcategory_id' => ['nullable', 'integer'], 'min_price' => ['nullable', 'numeric', 'min:0'], 'max_price' => ['nullable', 'numeric', 'gte:min_price'], 'search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'page' => ['nullable', 'integer', 'min:1']]);
        $goods = Good::query()->with(['subcategory', 'colors'])->catalogFilters($filters)->latest('id')->paginate($filters['per_page'] ?? 7)->withQueryString();

        return GoodResource::collection($goods);
    }

    public function show(Good $good): GoodDetailResource
    {
        return new GoodDetailResource($good->load(['category', 'subcategory', 'colors', 'materials', 'images' => fn ($q) => $q->orderBy('sort_order')]));
    }

    public function store(GoodRequest $request): GoodDetailResource
    {
        $this->authorize('create', Good::class);
        $data = $request->validated();
        $good = DB::transaction(function () use ($data): Good {
            $good = Good::create(collect($data)->except(['color_ids', 'material_ids'])->all());
            $good->colors()->sync($data['color_ids']);
            $good->materials()->sync($data['material_ids']);

            return $good;
        });

        return new GoodDetailResource($good->load(['category', 'subcategory', 'colors', 'materials', 'images']));
    }

    public function update(GoodRequest $request, Good $good): GoodDetailResource
    {
        $this->authorize('update', $good);
        $data = $request->validated();
        DB::transaction(function () use ($data, $good): void {
            $removedColors = $good->colors()->whereNotIn('colors.id', $data['color_ids'])->pluck('colors.id');
            abort_if($good->images()->whereIn('color_id', $removedColors)->exists(), 409, 'Remove images before detaching their product color.');
            $good->update(collect($data)->except(['color_ids', 'material_ids'])->all());
            $good->colors()->sync($data['color_ids']);
            $good->materials()->sync($data['material_ids']);
        });

        return new GoodDetailResource($good->fresh()->load(['category', 'subcategory', 'colors', 'materials', 'images']));
    }

    public function destroy(Good $good)
    {
        $this->authorize('delete', $good);
        $good->delete();

        return response()->noContent();
    }
}
