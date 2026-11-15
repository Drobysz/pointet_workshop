<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderTrackingLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            // Who added the link is internal; customers only see the link itself.
            'user_id' => $this->when($request->user()?->isAdmin() === true, $this->user_id),
            'tracking_url' => $this->tracking_url,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
