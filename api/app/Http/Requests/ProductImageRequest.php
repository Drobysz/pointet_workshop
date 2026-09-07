<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['color_id' => ['required', 'integer', 'exists:colors,id'], 'image' => ['required', 'file', 'image', 'mimes:jpeg,png,webp', 'max:10240'], 'name' => ['nullable', 'string', 'max:120'], 'sort_order' => ['nullable', 'integer', 'min:0', 'max:65535']];
    }
}
