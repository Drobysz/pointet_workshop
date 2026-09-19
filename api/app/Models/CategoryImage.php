<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CategoryImage extends Model
{
    protected $fillable = ['name', 'path', 'url'];

    public function category(): HasOne
    {
        return $this->hasOne(Category::class, 'image_id');
    }
}
