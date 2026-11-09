<?php

namespace App\Http\Resources;

use App\Services\Translation\Localizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => Localizer::name($this->resource, $request),
            'image_id' => $this->image_id,
            'image' => new CategoryImageResource($this->whenLoaded('image')),
            'subcategories' => SubcategoryResource::collection($this->whenLoaded('subcategories')),
            ...Localizer::block($this->resource, $request),
        ];
    }
}
