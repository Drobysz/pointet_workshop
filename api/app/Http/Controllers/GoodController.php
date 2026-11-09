<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoodRequest;
use App\Http\Resources\GoodResource;
use App\Models\Good;
use App\Services\Catalog\InventoryService;
use App\Services\Catalog\ProductImageService;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationSync;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GoodController extends Controller
{
    private const RESOURCE_RELATIONS = [
        'category.image', 'category.translations', 'subcategory.translations', 'colors.translations',
        'materials.translations', 'inventory', 'translations',
    ];

    public function __construct(
        private readonly InventoryService $inventory,
        private readonly CatalogTranslator $translator,
        private readonly ProductImageService $images,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return $this->collection($request, visibleOnly: true);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Good::class);
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);

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
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);

        return $this->resource($good);
    }

    public function store(GoodRequest $request): GoodResource
    {
        $this->authorize('create', Good::class);
        $data = $request->validated();
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $good = DB::transaction(function () use ($request, $data): Good {
            $good = Good::create([...$this->attributes($data), 'source_locale' => $request->sourceLocaleFor(null)]);
            $this->inventory->replace($good, $data['inventory']);
            $good->materials()->sync($data['material_ids']);
            $this->translator->applyManual($good, $request->manualTranslations());

            return $good;
        });

        return $this->resource($good);
    }

    public function update(GoodRequest $request, Good $good): GoodResource
    {
        $this->authorize('update', $good);
        $data = $request->validated();
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        DB::transaction(function () use ($request, $data, $good): void {
            $locked = Good::query()->lockForUpdate()->findOrFail($good->id);
            $inventoryIsStale = $locked->inventory_version
                !== (int) $data['inventory_version'];
            abort_if(
                $inventoryIsStale,
                409,
                'Stock changed while this form was open. Reload the product before saving.',
            );
            $locked->update([...$this->attributes($data), 'source_locale' => $request->sourceLocaleFor($locked)]);
            $this->inventory->replace($locked, $data['inventory']);
            $locked->materials()->sync($data['material_ids']);
            if ($this->translator->applyManual($locked, $request->manualTranslations())) {
                TranslationSync::queue($locked);
            }
        });

        return $this->resource($good->fresh());
    }

    public function destroy(Good $good)
    {
        $this->authorize('delete', $good);
        // Rows cascade in the database; stored files have to be removed explicitly.
        $good->images->each(fn ($image) => $this->images->delete($image));
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
            'weigh',
            'description',
            'visible',
        ])->all();
    }
}
