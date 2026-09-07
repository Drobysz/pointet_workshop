<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class OrderDetailResource extends OrderResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + ['customer' => new UserResource($this->whenLoaded('user')), 'items' => OrderItemResource::collection($this->whenLoaded('items'))];
    }
}
