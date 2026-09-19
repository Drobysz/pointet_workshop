<?php

namespace App\Services\Catalog;

use Illuminate\Support\Facades\Storage;

class CatalogImageUrl
{
    public static function resolve(string $path, ?string $storedUrl): ?string
    {
        if (! config('filesystems.disks.s3.bucket')) {
            return $storedUrl;
        }
        $disk = Storage::disk('s3');
        if (config('filesystems.disks.s3.signed_urls', true) && $disk->providesTemporaryUrls()) {
            return $disk->temporaryUrl($path, now()->addMinutes(60));
        }

        return $storedUrl ?: $disk->url($path);
    }
}
