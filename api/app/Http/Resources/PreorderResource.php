<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreorderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'payment_status' => $this->payment_status->value,
            'payment_amount_cents' => $this->payment_amount_cents,
            'currency' => $this->currency,
            'paid_at' => $this->paid_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'checkout_url' => $this->when(isset($this->checkout_url), $this->checkout_url),
            'registers' => PreorderRegisterResource::collection($this->whenLoaded('registers')),
        ];
    }
}
