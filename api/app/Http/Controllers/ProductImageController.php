<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductImageRequest;
use App\Http\Resources\ImageResource;
use App\Models\Color;
use App\Models\Good;
use App\Models\ProductImage;
use App\Services\Catalog\ProductImageService;

class ProductImageController extends Controller
{
    public function __construct(private readonly ProductImageService $images) {}

    public function store(ProductImageRequest $request, Good $good): ImageResource
    {
        $data = $request->validated();
        $image = $this->images->store($good, Color::findOrFail($data['color_id']), $data['image'], $data['name'] ?? null, $data['sort_order'] ?? 0);

        return new ImageResource($image);
    }

    public function update(ProductImage $image): ImageResource
    {
        $data = request()->validate(['name' => ['sometimes', 'string', 'max:120'], 'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535']]);
        $image->update($data);

        return new ImageResource($image);
    }

    public function destroy(ProductImage $image)
    {
        $this->images->delete($image);

        return response()->noContent();
    }
}
