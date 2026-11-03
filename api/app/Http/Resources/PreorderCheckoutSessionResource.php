<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreorderCheckoutSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_status' => $this->payment_status->value,
            'payment_amount_cents' => $this->payment_amount_cents,
            'currency' => $this->currency,
            'paid_at' => $this->paid_at?->toISOString(),
            'checkout_url' => $this->when($this->stripe_checkout_url !== null, $this->stripe_checkout_url),
            'preorder_id' => $this->preorder_id,
        ];
    }
}
