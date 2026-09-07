<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class GoodDetailResource extends GoodResource
{
    public function toArray(Request $request): array
    {
        $base = parent::toArray($request);
        $images = $this->relationLoaded('images') ? $this->images->groupBy('color_id') : collect();
        $base['category'] = new CategoryResource($this->whenLoaded('category'));
        $base['materials'] = MaterialResource::collection($this->whenLoaded('materials'));
        $base['colors'] = $this->whenLoaded('colors', fn () => $this->colors->map(fn ($color) => [
            'id' => $color->id, 'name' => $color->name, 'hexcode' => $color->hexcode,
            'images' => ImageResource::collection($images->get($color->id, collect())),
        ])->values());

        return $base;
    }
}
