<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Catalog\CategoryImageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryImageService $images) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
        ]);
        $search = $filters['search'] ?? null;
        $categories = Category::query()
            ->with(['subcategories', 'image'])
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
