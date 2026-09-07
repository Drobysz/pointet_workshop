<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'price' => (string) $this->price,
            'current_quantity' => $this->current_quantity, 'description' => $this->description,
            'category_id' => $this->category_id, 'subcategory_id' => $this->subcategory_id,
            'subcategory' => new SubcategoryResource($this->whenLoaded('subcategory')),
            'colors' => ColorResource::collection($this->whenLoaded('colors')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
