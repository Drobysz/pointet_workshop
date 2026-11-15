<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderTrackingLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $url = $this->input('tracking_url');

        if (is_string($url)) {
            $this->merge(['tracking_url' => trim($url)]);
        }
    }

    public function rules(): array
    {
        return [
            // Only web links: the URL is rendered as a clickable link in the customer's email.
            'tracking_url' => ['required', 'string', 'url:http,https', 'max:2048'],
        ];
    }
}
