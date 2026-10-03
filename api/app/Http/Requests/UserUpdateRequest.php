<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['prohibited'],
            'password' => ['prohibited'],
            'full_name' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:255'],
            'tel' => ['nullable', 'string', 'max:255'],
            'language' => ['sometimes', Rule::in(['en', 'it', 'fr', 'ru', 'de'])],
        ];
    }
}
