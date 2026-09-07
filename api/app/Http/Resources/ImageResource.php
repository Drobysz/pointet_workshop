<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = $this->url;
        if (! $url && config('filesystems.disks.s3.bucket')) {
            $url = Storage::disk('s3')->url($this->path);
        }

        return ['id' => $this->id, 'name' => $this->name, 'path' => $this->path, 'url' => $url, 'sort_order' => $this->sort_order];
    }
}
