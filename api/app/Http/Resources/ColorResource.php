<?php

namespace App\Http\Resources;

use App\Services\Translation\Localizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ColorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => Localizer::name($this->resource, $request),
            'hexcode' => $this->hexcode,
            ...Localizer::block($this->resource, $request),
        ];
    }
}
