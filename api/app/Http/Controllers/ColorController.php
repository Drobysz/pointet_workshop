<?php

namespace App\Http\Controllers;

use App\Http\Requests\ColorRequest;
use App\Http\Resources\ColorResource;
use App\Models\Color;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\RequestLocale;
use App\Services\Translation\TranslationSync;

class ColorController extends Controller
{
    public function __construct(private readonly CatalogTranslator $translator) {}

    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return ColorResource::collection(Color::with('translations')->when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(ColorRequest $request): ColorResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $color = Color::create([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor(null)]);
        $this->applyTranslations($color, $request);

        return new ColorResource($color->load('translations'));
    }

    public function update(ColorRequest $request, Color $color): ColorResource
    {
        request()->attributes->set(RequestLocale::INCLUDE_TRANSLATIONS, true);
        $color->update([...$request->attributesExceptTranslations(), 'source_locale' => $request->sourceLocaleFor($color)]);
        $this->applyTranslations($color, $request);

        return new ColorResource($color->load('translations'));
    }

    public function destroy(Color $color)
    {
        $color->delete();

        return response()->noContent();
    }

    private function applyTranslations(Color $color, ColorRequest $request): void
    {
        if ($this->translator->applyManual($color, $request->manualTranslations())) {
            TranslationSync::queue($color);
        }
    }
}
