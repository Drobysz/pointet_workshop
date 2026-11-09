<?php

namespace App\Http\Resources;

use App\Services\Translation\Localizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => Localizer::name($this->resource, $request),
            ...Localizer::block($this->resource, $request),
        ];
    }
}
