<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'tel_number' => $this->tel_number,
            'country' => $this->country,
            'email' => $this->email,
            'brand_name' => $this->brand_name,
            'company_address' => $this->company_address,
            'description_of_contact' => $this->description_of_contact,
            'description_of_brand' => $this->description_of_brand,
            'isResidentOfEU' => $this->is_resident_of_eu,
            'status' => $this->status->value,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'response_message' => $this->response_message,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
