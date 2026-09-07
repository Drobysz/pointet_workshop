<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'subcategory_id' => ['required', 'integer', Rule::exists('subcategories', 'id')->where(fn ($q) => $q->where('category_id', $this->integer('category_id')))],
            'price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'current_quantity' => ['required', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:65535'],
            'color_ids' => ['present', 'array'], 'color_ids.*' => ['integer', 'distinct', 'exists:colors,id'],
            'material_ids' => ['present', 'array'], 'material_ids.*' => ['integer', 'distinct', 'exists:materials,id'],
        ];
    }
}
