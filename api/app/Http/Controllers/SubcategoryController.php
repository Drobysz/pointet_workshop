<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubcategoryRequest;
use App\Http\Resources\SubcategoryResource;
use App\Models\Subcategory;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationSync;

class SubcategoryController extends Controller
{
    public function __construct(private readonly CatalogTranslator $translator) {}

    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return SubcategoryResource::collection(Subcategory::with(['category.image', 'category.translations', 'translations'])->when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(SubcategoryRequest $request): SubcategoryResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $subcategory = Subcategory::create([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor(null)]);
        $this->applyTranslations($subcategory, $request);

        return new SubcategoryResource($subcategory->load(['category.image', 'translations']));
    }

    public function update(SubcategoryRequest $request, Subcategory $subcategory): SubcategoryResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $subcategory->update([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor($subcategory)]);
        $this->applyTranslations($subcategory, $request);

        return new SubcategoryResource($subcategory->load(['category.image', 'translations']));
    }

    public function destroy(Subcategory $subcategory)
    {
        $subcategory->delete();

        return response()->noContent();
    }

    private function applyTranslations(Subcategory $subcategory, SubcategoryRequest $request): void
    {
        if ($this->translator->applyManual($subcategory, $request->manualTranslations())) {
            TranslationSync::queue($subcategory);
        }
    }
}
