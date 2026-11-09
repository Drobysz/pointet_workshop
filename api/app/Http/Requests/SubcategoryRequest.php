<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubcategoryRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255', Rule::unique('subcategories')->where(fn ($q) => $q->where('category_id', $this->integer('category_id')))->ignore($this->route('subcategory'))], 'category_id' => ['required', 'integer', 'exists:categories,id'], ...$this->translationRules()];
    }
}
