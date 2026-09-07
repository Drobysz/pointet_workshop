<?php

namespace App\Http\Controllers;

use App\Http\Requests\ColorRequest;
use App\Http\Resources\ColorResource;
use App\Models\Color;

class ColorController extends Controller
{
    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return ColorResource::collection(Color::when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(ColorRequest $request): ColorResource
    {
        return new ColorResource(Color::create($request->validated()));
    }

    public function update(ColorRequest $request, Color $color): ColorResource
    {
        $color->update($request->validated());

        return new ColorResource($color);
    }

    public function destroy(Color $color)
    {
        $color->delete();

        return response()->noContent();
    }
}
