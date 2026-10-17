<?php

namespace App\Http\Resources;

use App\Services\Catalog\CatalogImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = CatalogImageUrl::resolve($this->path, $this->url);

        return [
            'id' => $this->id,
            'color_id' => $this->color_id,
            'name' => $this->name,
            'path' => $this->path,
            'url' => $url,
            'sort_order' => $this->sort_order,
        ];
    }
}
