<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductImageRequest;
use App\Http\Requests\UpdateProductImageRequest;
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
        $image = $this->images->store(
            $good,
            Color::findOrFail($data['color_id']),
            $data['image'],
            $data['name'] ?? null,
            $data['sort_order'] ?? 0,
        );

        return new ImageResource($image);
    }

    public function update(
        UpdateProductImageRequest $request,
        ProductImage $image,
    ): ImageResource {
        $data = $request->validated();
        $colorId = $data['color_id'] ?? $image->color_id;
        $colorBelongsToProduct = $image->good
            ->inventory()
            ->where('color_id', $colorId)
            ->exists();

        abort_unless(
            $colorBelongsToProduct,
            422,
            'The selected color is not assigned to this product.',
        );

        $image->update($data);

        return new ImageResource($image->fresh());
    }

    public function destroy(ProductImage $image)
    {
        $this->images->delete($image);

        return response()->noContent();
    }
}
