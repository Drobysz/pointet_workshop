<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Catalog\CategoryImageService;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryImageService $images) {}

    public function index()
    {
        $data = request()->validate(['search' => ['nullable', 'string', 'max:120'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return CategoryResource::collection(Category::with(['subcategories', 'image'])->when($data['search'] ?? null, fn ($q, $search) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($search).'%']))->orderBy('name')->paginate($data['per_page'] ?? 50)->withQueryString());
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        return new CategoryResource($this->images->save(new Category, $request->validated('name'), $request->file('image')));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        return new CategoryResource($this->images->save($category, $request->validated('name'), $request->file('image'), $request->boolean('remove_image')));
    }

    public function destroy(Category $category)
    {
        $this->images->delete($category);

        return response()->noContent();
    }
}
