<?php

namespace App\Http\Resources;

use App\Services\Catalog\CatalogImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'path' => $this->path, 'url' => CatalogImageUrl::resolve($this->path, $this->url)];
    }
}
