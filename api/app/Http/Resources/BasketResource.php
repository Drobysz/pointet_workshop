<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BasketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'good_register_id' => $this->good_register_id, 'inventory' => new GoodRegisterResource($this->whenLoaded('inventory')), 'quantity' => $this->quantity, 'good' => new GoodResource($this->whenLoaded('good')), 'color' => new ColorResource($this->whenLoaded('color'))];
    }
}
