<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubcategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255', Rule::unique('subcategories')->where(fn ($q) => $q->where('category_id', $this->integer('category_id')))->ignore($this->route('subcategory'))], 'category_id' => ['required', 'integer', 'exists:categories,id']];
    }
}
