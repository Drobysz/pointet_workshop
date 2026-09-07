<?php

namespace App\Services\Catalog;

use App\Models\Color;
use App\Models\Good;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductImageService
{
    public function store(Good $good, Color $color, UploadedFile $file, ?string $name, int $sortOrder): ProductImage
    {
        abort_unless($good->colors()->whereKey($color->id)->exists(), 422, 'The selected color is not assigned to this product.');
        $colorDirectory = Str::slug($color->name) ?: "color-{$color->id}";
        $safeName = Str::slug(pathinfo($name ?: $file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'image';
        $filename = $safeName.'-'.Str::lower(Str::random(10)).'.'.$file->extension();
        $path = "goods/{$good->id}/{$colorDirectory}/{$filename}";
        Storage::disk('s3')->putFileAs(dirname($path), $file, basename($path), ['visibility' => 'public']);

        try {
            return ProductImage::create(['good_id' => $good->id, 'color_id' => $color->id, 'name' => $name ?: $safeName, 'path' => $path, 'url' => Storage::disk('s3')->url($path), 'sort_order' => $sortOrder]);
        } catch (Throwable $exception) {
            Storage::disk('s3')->delete($path);
            throw $exception;
        }
    }

    public function delete(ProductImage $image): void
    {
        if (Storage::disk('s3')->exists($image->path)) {
            Storage::disk('s3')->delete($image->path);
        }
        $image->delete();
    }
}
