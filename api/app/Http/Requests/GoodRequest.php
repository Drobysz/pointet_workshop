<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesTranslations;
use App\Services\Catalog\InventoryService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class GoodRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_array($this->input('inventory'))) {
            $this->merge(['inventory' => array_map(function ($row) {
                if (! is_array($row)) {
                    return $row;
                }
                if (isset($row['size']) && is_string($row['size'])) {
                    $row['size'] = trim($row['size']) ?: null;
                }

                return $row;
            }, $this->input('inventory'))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'subcategory_id' => ['required', 'integer', Rule::exists('subcategories', 'id')->where(fn ($q) => $q->where('category_id', $this->integer('category_id')))],
            'price' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'weigh' => ['sometimes', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:65535'],
            'visible' => ['sometimes', 'boolean'],
            'inventory_version' => [Rule::requiredIf(! $this->isMethod('post')), 'integer', 'min:0'],
            'inventory' => ['required', 'array', 'min:1', 'max:500'],
            'inventory.*' => ['required', 'array:id,color_id,size,quantity'],
            'inventory.*.id' => ['sometimes', 'integer', 'distinct', Rule::prohibitedIf($this->isMethod('post'))],
            'inventory.*.color_id' => ['required', 'integer', 'exists:colors,id'],
            'inventory.*.size' => ['nullable', 'string', 'max:120'],
            'inventory.*.quantity' => ['required', 'integer', 'min:0', 'max:'.InventoryService::MAX_QUANTITY],
            'material_ids' => ['present', 'array'],
            'material_ids.*' => ['integer', 'distinct', 'exists:materials,id'],
            ...$this->translationRules(config('translation.goods.fields', ['name'])),
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $seen = [];
            foreach ($this->input('inventory') as $index => $row) {
                $key = $row['color_id'].'|'.mb_strtolower($row['size'] ?? '');
                if (isset($seen[$key])) {
                    $validator->errors()->add("inventory.{$index}.size", 'Each color/size combination must be unique.');
                }
                $seen[$key] = true;
            }
        }];
    }
}
