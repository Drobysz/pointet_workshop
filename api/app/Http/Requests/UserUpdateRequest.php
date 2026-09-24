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
        $user = $this->route('user');

        return ['email' => ['sometimes', 'email:rfc', 'max:255', Rule::unique('users')->ignore($user)], 'full_name' => ['sometimes', 'string', 'max:255'], 'address' => ['sometimes', 'string', 'max:255'], 'tel' => ['nullable', 'string', 'max:255'], 'language' => ['sometimes', Rule::in(['en', 'it', 'fr', 'ru', 'de'])], 'avatar_url' => ['nullable', 'url', 'max:2048'], 'password' => ['sometimes', 'string', 'min:8', 'max:72', 'regex:/[[:alpha:]]/', 'regex:/[[:digit:]]/']];
    }
}
