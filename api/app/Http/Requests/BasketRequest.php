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
        return [
            'good_register_id' => [Rule::requiredIf($this->isMethod('post')), Rule::prohibitedIf(! $this->isMethod('post')), 'integer', 'exists:good_register,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
