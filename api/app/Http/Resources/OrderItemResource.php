<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'good_id' => $this->good_id, 'product_name' => $this->product_name, 'color_name' => $this->color_name, 'size' => $this->size, 'good_register_id' => $this->good_register_id, 'unit_price' => (string) $this->unit_price, 'quantity' => $this->quantity, 'line_total' => number_format((float) $this->unit_price * $this->quantity, 2, '.', ''), 'status' => $this->status->value];
    }
}
