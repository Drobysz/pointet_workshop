<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Services\Translation\Contracts\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Material extends Model implements Translatable
{
    use HasFactory, HasTranslations;

    protected $fillable = ['name', 'source_locale'];

    public function goods(): BelongsToMany
    {
        return $this->belongsToMany(Good::class);
    }
}
