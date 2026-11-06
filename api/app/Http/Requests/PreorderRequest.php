<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PreorderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');

        if (is_string($email)) {
            $this->merge(['email' => Str::lower(trim($email))]);
        }
    }

    public function rules(): array
    {
        return $this->isMethod('post')
            ? [
                'idempotency_key' => ['required', 'uuid'],
                // Account checkouts use the authenticated user's email.
                'email' => [Rule::requiredIf($this->user() === null), 'nullable', 'string', 'email:rfc', 'max:255'],
                // Authenticated checkouts read their persisted basket. Guest
                // checkouts submit only inventory references from their cookie.
                'items' => ['nullable', 'array', 'max:20'],
                'items.*.inventory_id' => ['required_with:items', 'integer', 'min:1'],
                'items.*.quantity' => ['required_with:items', 'integer', 'min:1', 'max:99'],
            ]
            : [];
    }
}
