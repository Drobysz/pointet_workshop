<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubcategoryRequest;
use App\Http\Resources\SubcategoryResource;
use App\Models\Subcategory;

class SubcategoryController extends Controller
{
    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return SubcategoryResource::collection(Subcategory::with('category.image')->when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(SubcategoryRequest $request): SubcategoryResource
    {
        return new SubcategoryResource(Subcategory::create($request->validated())->load('category.image'));
    }

    public function update(SubcategoryRequest $request, Subcategory $subcategory): SubcategoryResource
    {
        $subcategory->update($request->validated());

        return new SubcategoryResource($subcategory->load('category.image'));
    }

    public function destroy(Subcategory $subcategory)
    {
        $subcategory->delete();

        return response()->noContent();
    }
}
