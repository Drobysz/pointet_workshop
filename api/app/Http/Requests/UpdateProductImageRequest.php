<?php

namespace App\Http\Requests;

use App\Models\ProductImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        /** @var ProductImage $image */
        $image = $this->route('image');

        if ($this->has('color_id') && ! $this->has('name')) {
            $this->merge(['name' => $image->name]);
        }
    }

    public function rules(): array
    {
        /** @var ProductImage $image */
        $image = $this->route('image');
        $colorId = $this->integer('color_id') ?: $image->color_id;

        return [
            'color_id' => ['sometimes', 'integer', 'exists:colors,id'],
            'name' => [
                'sometimes',
                'string',
                'min:1',
                'max:120',
                Rule::unique('images', 'name')
                    ->where('good_id', $image->good_id)
                    ->where('color_id', $colorId)
                    ->ignore($image->id),
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ];
    }
}
