<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'address' => $this->address,
            'tel' => $this->tel,
            'language' => $this->language,
            'role' => $this->role->value,
            'orders_count' => (int) $this->orders_count,
            'basket_goods_count' => (int) ($this->basket_goods_count ?? 0),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
