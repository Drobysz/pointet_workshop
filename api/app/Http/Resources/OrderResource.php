<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'user_id' => $this->user_id, 'customer_name' => $this->customer_name, 'customer_email' => $this->customer_email, 'status' => $this->status->value, 'placed_at' => $this->placed_at?->toISOString(), 'total' => number_format((float) ($this->items_sum_total ?? $this->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity)), 2, '.', '')];
    }
}
