<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreorderAnalyticsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->id,
            'product_name' => $this->name,
            'image_url' => $this->image_url,
            'original_price' => (string) $this->price,
            'preordered_quantity' => (int) $this->preordered_quantity,
        ];
    }
}
