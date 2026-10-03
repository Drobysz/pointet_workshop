<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class EmailChangeVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user instanceof User && $this->user()?->can('update', $user) === true;
    }

    public function rules(): array
    {
        return ['code' => ['required', 'digits:6']];
    }
}
