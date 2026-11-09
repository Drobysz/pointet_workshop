<?php

namespace App\Http\Controllers;

use App\Http\Requests\MaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationSync;

class MaterialController extends Controller
{
    public function __construct(private readonly CatalogTranslator $translator) {}

    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return MaterialResource::collection(Material::with('translations')->when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(MaterialRequest $request): MaterialResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $material = Material::create([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor(null)]);
        $this->applyTranslations($material, $request);

        return new MaterialResource($material->load('translations'));
    }

    public function update(MaterialRequest $request, Material $material): MaterialResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $material->update([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor($material)]);
        $this->applyTranslations($material, $request);

        return new MaterialResource($material->load('translations'));
    }

    public function destroy(Material $material)
    {
        $material->delete();

        return response()->noContent();
    }

    private function applyTranslations(Material $material, MaterialRequest $request): void
    {
        if ($this->translator->applyManual($material, $request->manualTranslations())) {
            TranslationSync::queue($material);
        }
    }
}
