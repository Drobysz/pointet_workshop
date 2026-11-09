<?php

namespace App\Services\Catalog;

use App\Models\Category;
use App\Models\CategoryImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class CategoryImageService
{
    public function save(Category $category, string $name, ?UploadedFile $file, bool $remove = false, ?string $sourceLocale = null): Category
    {
        $uploadedPath = null;
        $oldPath = null;
        try {
            $category = DB::transaction(function () use ($category, $name, $file, $remove, $sourceLocale, &$uploadedPath, &$oldPath): Category {
                if ($category->exists) {
                    $category = Category::query()->lockForUpdate()->findOrFail($category->id);
                }
                $category->name = $name;
                if ($sourceLocale) {
                    $category->source_locale = $sourceLocale;
                }
                $category->save();
                if ($file || $remove) {
                    $oldImage = $category->image;
                    $image = null;
                    if ($file) {
                        $filename = Str::uuid().'.'.$file->extension();
                        $uploadedPath = "categories/{$category->id}/{$filename}";
                        if (! Storage::disk('s3')->putFileAs(dirname($uploadedPath), $file, $filename)) {
                            throw new \RuntimeException('Category image upload failed.');
                        }
                        $image = CategoryImage::create([
                            'name' => mb_substr(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME), 0, 255),
                            'path' => $uploadedPath,
                            'url' => Storage::disk('s3')->url($uploadedPath),
                        ]);
                    }
                    $category->image()->associate($image);
                    $category->save();
                    if ($oldImage) {
                        $oldPath = $oldImage->path;
                        $oldImage->delete();
                    }
                }

                return $category->load(['image', 'subcategories']);
            });
        } catch (Throwable $exception) {
            if ($uploadedPath) {
                $this->cleanUp($uploadedPath);
            }
            throw $exception;
        }
        if ($oldPath) {
            $this->cleanUp($oldPath);
        }

        return $category;
    }

    public function delete(Category $category): void
    {
        $path = DB::transaction(function () use ($category): ?string {
            $category = Category::query()->lockForUpdate()->findOrFail($category->id);
            $image = $category->image;
            // Foreign-key failures must leave the image and its stored object intact.
            $category->delete();
            $image?->delete();

            return $image?->path;
        });
        if ($path) {
            $this->cleanUp($path);
        }
    }

    private function cleanUp(string $path): void
    {
        try {
            if (! Storage::disk('s3')->delete($path)) {
                throw new \RuntimeException('Could not remove obsolete category image: '.$path);
            }
        } catch (Throwable $exception) {
            // Do not report a failed save after the new image has already committed.
            report($exception);
        }
    }
}
