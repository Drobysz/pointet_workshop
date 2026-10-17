<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoodRequest;
use App\Http\Resources\GoodResource;
use App\Models\Good;
use App\Services\Catalog\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GoodController extends Controller
{
    private const RESOURCE_RELATIONS = ['category.image', 'subcategory', 'colors', 'materials', 'inventory'];

    public function __construct(private readonly InventoryService $inventory) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return $this->collection($request, visibleOnly: true);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Good::class);

        return $this->collection($request, visibleOnly: false);
    }

    public function show(Good $good): GoodResource
    {
        abort_unless($good->visible, 404);

        return $this->resource($good);
    }

    public function adminShow(Good $good): GoodResource
    {
        $this->authorize('view', $good);

        return $this->resource($good);
    }

    public function store(GoodRequest $request): GoodResource
    {
        $this->authorize('create', Good::class);
        $data = $request->validated();
        $good = DB::transaction(function () use ($data): Good {
            $good = Good::create($this->attributes($data));
            $this->inventory->replace($good, $data['inventory']);
            $good->materials()->sync($data['material_ids']);

            return $good;
        });

        return $this->resource($good);
    }

    public function update(GoodRequest $request, Good $good): GoodResource
    {
        $this->authorize('update', $good);
        $data = $request->validated();
        DB::transaction(function () use ($data, $good): void {
            $locked = Good::query()->lockForUpdate()->findOrFail($good->id);
            $inventoryIsStale = $locked->inventory_version
                !== (int) $data['inventory_version'];
            abort_if(
                $inventoryIsStale,
                409,
                'Stock changed while this form was open. Reload the product before saving.',
            );
            $locked->update($this->attributes($data));
            $this->inventory->replace($locked, $data['inventory']);
            $locked->materials()->sync($data['material_ids']);
        });

        return $this->resource($good->fresh());
    }

    public function destroy(Good $good)
    {
        $this->authorize('delete', $good);
        $good->delete();

        return response()->noContent();
    }

    private function collection(
        Request $request,
        bool $visibleOnly,
    ): AnonymousResourceCollection {
        $filters = $request->validate([
            'category_id' => ['nullable', 'integer'],
            'subcategory_id' => ['nullable', 'integer'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'gte:min_price'],
            'search' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $query = Good::query()
            ->with([
                ...self::RESOURCE_RELATIONS,
                'images' => fn ($imageQuery) => $imageQuery->orderBy('sort_order'),
            ])
            ->catalogFilters($filters)
            ->when($visibleOnly, fn ($goodsQuery) => $goodsQuery->visible())
            ->latest('id');
        $goods = $query
            ->paginate($filters['per_page'] ?? 7)
            ->withQueryString();

        return GoodResource::collection($goods);
    }

    private function resource(Good $good): GoodResource
    {
        $good->load([
            ...self::RESOURCE_RELATIONS,
            'images' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        return new GoodResource($good);
    }

    private function attributes(array $data): array
    {
        return collect($data)->only([
            'name',
            'brand',
            'category_id',
            'subcategory_id',
            'price',
            'description',
            'visible',
        ])->all();
    }
}
