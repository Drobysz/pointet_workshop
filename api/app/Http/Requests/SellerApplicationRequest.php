<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SellerApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'tel_number' => ['required', 'string', 'regex:/^\\+?[1-9][0-9]{6,14}$/'],
            'country' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'brand_name' => ['required', 'string', 'max:160'],
            'company_address' => ['required', 'string', 'max:500'],
            'description_of_contact' => ['required', 'string', 'max:4000'],
            'description_of_brand' => ['required', 'string', 'max:4000'],
            'is_resident_of_eu' => ['required', 'boolean'],
        ];
    }
}
