<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoodRequest;
use App\Http\Resources\GoodDetailResource;
use App\Http\Resources\GoodResource;
use App\Models\Good;
use App\Services\Catalog\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GoodController extends Controller
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate(['category_id' => ['nullable', 'integer'], 'subcategory_id' => ['nullable', 'integer'], 'min_price' => ['nullable', 'numeric', 'min:0'], 'max_price' => ['nullable', 'numeric', 'gte:min_price'], 'search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'page' => ['nullable', 'integer', 'min:1']]);
        $goods = Good::query()->with(['subcategory', 'colors', 'inventory'])->catalogFilters($filters)->latest('id')->paginate($filters['per_page'] ?? 7)->withQueryString();

        return GoodResource::collection($goods);
    }

    public function show(Good $good): GoodDetailResource
    {
        return new GoodDetailResource($good->load(['category.image', 'subcategory', 'colors', 'materials', 'inventory', 'images' => fn ($q) => $q->orderBy('sort_order')]));
    }

    public function store(GoodRequest $request): GoodDetailResource
    {
        $this->authorize('create', Good::class);
        $data = $request->validated();
        $good = DB::transaction(function () use ($data): Good {
            $good = Good::create(collect($data)->only(['name', 'category_id', 'subcategory_id', 'price', 'description'])->all());
            $this->inventory->replace($good, $data['inventory']);
            $good->materials()->sync($data['material_ids']);

            return $good;
        });

        return new GoodDetailResource($good->load(['category.image', 'subcategory', 'colors', 'materials', 'inventory', 'images']));
    }

    public function update(GoodRequest $request, Good $good): GoodDetailResource
    {
        $this->authorize('update', $good);
        $data = $request->validated();
        DB::transaction(function () use ($data, $good): void {
            $locked = Good::query()->lockForUpdate()->findOrFail($good->id);
            abort_if($locked->inventory_version !== (int) $data['inventory_version'], 409, 'Stock changed while this form was open. Reload the product before saving.');
            $locked->update(collect($data)->only(['name', 'category_id', 'subcategory_id', 'price', 'description'])->all());
            $this->inventory->replace($locked, $data['inventory']);
            $locked->materials()->sync($data['material_ids']);
        });

        return new GoodDetailResource($good->fresh()->load(['category.image', 'subcategory', 'colors', 'materials', 'inventory', 'images']));
    }

    public function destroy(Good $good)
    {
        $this->authorize('delete', $good);
        $good->delete();

        return response()->noContent();
    }
}
