<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ColorRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255', Rule::unique('colors')->ignore($this->route('color'))], 'hexcode' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'], ...$this->translationRules()];
    }
}
