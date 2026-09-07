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
        return ['status' => ['sometimes', Rule::enum(OrderStatus::class)], 'items' => ['required_without:status', 'array', 'min:1'], 'items.*.good_id' => ['required', 'integer', 'exists:goods,id'], 'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000'], 'items.*.color_id' => ['nullable', 'integer', 'exists:colors,id']];
    }
}
