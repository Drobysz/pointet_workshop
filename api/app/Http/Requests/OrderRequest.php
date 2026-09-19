<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if (! $this->isMethod('post')) {
            return ['status' => ['required', Rule::enum(OrderStatus::class)]];
        }

        return [
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.good_register_id' => ['required', 'integer', 'exists:good_register,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
