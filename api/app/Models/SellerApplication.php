<?php

namespace App\Models;

use App\Enums\SellerApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'tel_number', 'country', 'email', 'brand_name',
        'company_address', 'description_of_contact', 'description_of_brand',
        'is_resident_of_eu', 'status', 'reviewed_by', 'reviewed_at',
        'response_message', 'response_sent_at', 'submission_fingerprint',
    ];

    protected $hidden = ['submission_fingerprint'];

    protected function casts(): array
    {
        return [
            'is_resident_of_eu' => 'boolean',
            'status' => SellerApplicationStatus::class,
            'reviewed_at' => 'immutable_datetime',
            'response_sent_at' => 'immutable_datetime',
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
