<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
