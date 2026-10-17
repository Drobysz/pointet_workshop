<?php

namespace App\Services\Catalog;

use App\Models\Color;
use App\Models\Good;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductImageService
{
    public function store(
        Good $good,
        Color $color,
        UploadedFile $file,
        ?string $name,
        int $sortOrder,
    ): ProductImage {
        $path = null;
        try {
            return DB::transaction(function () use (
                $good,
                $color,
                $file,
                $name,
                $sortOrder,
                &$path,
            ): ProductImage {
                // Inventory replacement uses the same lock, so a color cannot vanish mid-upload.
                $good = Good::query()->lockForUpdate()->findOrFail($good->id);
                $colorIsAssigned = $good
                    ->inventory()
                    ->where('color_id', $color->id)
                    ->exists();
                abort_unless(
                    $colorIsAssigned,
                    422,
                    'The selected color is not assigned to this product.',
                );
                $colorDirectory = Str::slug($color->name) ?: "color-{$color->id}";
                $safeName = Str::slug(pathinfo($name ?: $file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'image';
                $filename = $safeName.'-'.Str::lower(Str::random(10)).'.'.$file->extension();
                $path = "goods/{$good->id}/{$colorDirectory}/{$filename}";
                if (! Storage::disk('s3')->putFileAs(dirname($path), $file, basename($path))) {
                    throw new \RuntimeException('Product image upload failed.');
                }

                return ProductImage::create([
                    'good_id' => $good->id,
                    'color_id' => $color->id,
                    'name' => $name ?: $safeName,
                    'path' => $path,
                    'url' => Storage::disk('s3')->url($path),
                    'sort_order' => $sortOrder,
                ]);
            });
        } catch (Throwable $exception) {
            if ($path) {
                try {
                    Storage::disk('s3')->delete($path);
                } catch (Throwable $cleanup) {
                    report($cleanup);
                }
            }
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
