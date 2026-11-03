<?php

namespace App\Http\Requests;

use App\Services\Checkout\GuestBasketService;
use Illuminate\Foundation\Http\FormRequest;

class GuestBasketValidationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'items' => ['present', 'array', 'max:'.GuestBasketService::MAX_ITEMS],
            'items.*.inventory_id' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:'.GuestBasketService::MAX_QUANTITY],
        ];
    }
}
