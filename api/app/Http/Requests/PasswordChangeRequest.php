<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class PasswordChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user instanceof User && $this->user()?->can('update', $user) === true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'max:72'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'max:72',
                'regex:/[[:alpha:]]/',
                'regex:/[[:digit:]]/',
                'different:current_password',
            ],
        ];
    }
}
