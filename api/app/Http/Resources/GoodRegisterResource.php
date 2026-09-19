<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodRegisterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'good_id' => $this->good_id, 'color_id' => $this->color_id, 'size' => $this->size, 'quantity' => $this->quantity];
    }
}
