<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PreorderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->isMethod('post')
            ? [
                'idempotency_key' => ['required', 'uuid'],
                // Authenticated checkouts read their persisted basket. Guest
                // checkouts submit only inventory references from their cookie.
                'items' => ['nullable', 'array', 'max:20'],
                'items.*.inventory_id' => ['required_with:items', 'integer', 'min:1'],
                'items.*.quantity' => ['required_with:items', 'integer', 'min:1', 'max:99'],
            ]
            : [];
    }
}
