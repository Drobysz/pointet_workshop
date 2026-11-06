<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionalEmail extends Model
{
    protected $fillable = ['event_key', 'template', 'locale', 'payload', 'attempts', 'available_at', 'sent_at'];

    protected $hidden = ['payload'];

    protected function casts(): array
    {
        return [
            'payload' => 'encrypted:array',
            'attempts' => 'integer',
            'available_at' => 'immutable_datetime',
            'sent_at' => 'immutable_datetime',
        ];
    }
}
