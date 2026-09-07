<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BasketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['good_id' => [Rule::requiredIf($this->isMethod('post')), 'integer', 'exists:goods,id'], 'color_id' => ['nullable', 'integer', 'exists:colors,id'], 'quantity' => ['required', 'integer', 'min:1', 'max:1000']];
    }
}
