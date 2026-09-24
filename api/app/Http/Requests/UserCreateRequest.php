<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email:rfc',
                'max:255',
                'unique:users,email',
            ],
            'full_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],
            'address' => [
                'required',
                'string',
                'max:255',
            ],
            'tel' => [
                'nullable',
                'string',
                'max:255',
            ],
            'language' => [
                'nullable',
                Rule::in(['en', 'it', 'fr', 'ru', 'de']),
            ],
            'avatar_url' => [
                'nullable',
                'url',
                'max:2048',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:72',
                'regex:/[[:alpha:]]/',
                'regex:/[[:digit:]]/',
            ],
        ];
    }
}
