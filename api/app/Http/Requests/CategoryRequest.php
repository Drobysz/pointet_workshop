<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:10240'], 'remove_image' => ['sometimes', 'boolean', Rule::prohibitedIf(fn () => $this->hasFile('image'))], 'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($this->route('category'))]];
    }
}
