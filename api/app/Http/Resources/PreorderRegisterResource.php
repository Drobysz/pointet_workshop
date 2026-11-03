<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreorderRegisterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('good')
            && $this->good?->relationLoaded('images')
            && $this->relationLoaded('inventory')
            ? $this->good->images
                ->where('color_id', $this->inventory?->color_id)
                ->sortBy('sort_order')
                ->values()
            : collect();

        return [
            'id' => $this->id,
            'good_id' => $this->good_id,
            'good_register_id' => $this->good_register_id,
            'product_name' => $this->product_name,
            'color_name' => $this->color_name,
            'size' => $this->size,
            'original_unit_price' => (string) $this->original_unit_price,
            'quantity' => $this->quantity,
            'images' => ImageResource::collection($images),
        ];
    }
}
