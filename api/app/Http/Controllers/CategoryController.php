<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Catalog\CategoryImageService;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationSync;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryImageService $images,
        private readonly CatalogTranslator $translator,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
        ]);
        $search = $filters['search'] ?? null;
        $categories = Category::query()
            ->with(['subcategories.translations', 'image', 'translations'])
            ->when($search, function ($query, string $search): void {
                $normalizedSearch = mb_strtolower($search);

                $query->whereRaw(
                    'LOWER(name) LIKE ?',
                    ["%{$normalizedSearch}%"],
                );
            })
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $category = $this->images->save(new Category, $request->validated('name'), $request->file('image'), sourceLocale: $request->sourceLocaleFor(null));

        return new CategoryResource($this->applyTranslations($category, $request));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $category = $this->images->save($category, $request->validated('name'), $request->file('image'), $request->boolean('remove_image'), $request->sourceLocaleFor($category));

        return new CategoryResource($this->applyTranslations($category, $request));
    }

    public function destroy(Category $category)
    {
        $this->images->delete($category);

        return response()->noContent();
    }

    private function applyTranslations(Category $category, CategoryRequest $request): Category
    {
        if ($this->translator->applyManual($category, $request->manualTranslations())) {
            TranslationSync::queue($category);
        }

        return $category->load('translations');
    }
}
