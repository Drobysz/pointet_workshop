<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:72', 'regex:/[[:alpha:]]/', 'regex:/[[:digit:]]/'],
            'full_name' => ['required', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:255'],
            'tel' => ['nullable', 'string', 'max:255'],
            'language' => ['nullable', Rule::in(['en', 'it', 'fr', 'ru', 'de'])],
            'refer_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
