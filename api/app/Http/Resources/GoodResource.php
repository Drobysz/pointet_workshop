<?php

namespace App\Http\Resources;

use App\Services\Translation\Localizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('images') ? $this->images->groupBy('color_id') : collect();

        return [
            'id' => $this->id, 'name' => Localizer::name($this->resource, $request), 'brand' => $this->brand, 'price' => (string) $this->price,
            'weigh' => $this->weigh,
            'visible' => $this->visible,
            'current_quantity' => $this->current_quantity, 'inventory_version' => $this->inventory_version,
            'inventory' => GoodRegisterResource::collection($this->whenLoaded('inventory')), 'description' => $this->description,
            'category_id' => $this->category_id, 'subcategory_id' => $this->subcategory_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'subcategory' => new SubcategoryResource($this->whenLoaded('subcategory')),
            'materials' => MaterialResource::collection($this->whenLoaded('materials')),
            'colors' => $this->whenLoaded('colors', fn () => $this->colors->map(fn ($color) => [
                'id' => $color->id, 'name' => Localizer::name($color, $request), 'hexcode' => $color->hexcode,
                'images' => ImageResource::collection($images->get($color->id, collect())),
            ])->values()),
            'created_at' => $this->created_at?->toISOString(),
            ...Localizer::block($this->resource, $request),
        ];
    }
}
