<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Good;
use App\Models\Material;
use App\Models\Subcategory;
use App\Services\Translation\CatalogTranslator;
use App\Services\Translation\TranslationSync;
use Illuminate\Http\JsonResponse;

class TranslationController extends Controller
{
    private const TYPES = [
        'goods' => Good::class,
        'categories' => Category::class,
        'subcategories' => Subcategory::class,
        'colors' => Color::class,
        'materials' => Material::class,
    ];

    public function usage(CatalogTranslator $translator): JsonResponse
    {
        return response()->json(['data' => [
            'enabled' => $translator->isEnabled(),
            ...$translator->usage()->status(),
        ]]);
    }

    /** Re-queues the automatic translations of one record. Manual translations are kept. */
    public function regenerate(string $type, int $id): JsonResponse
    {
        $class = self::TYPES[$type] ?? abort(404);
        $model = $class::query()->findOrFail($id);
        TranslationSync::queue($model, force: true);

        return response()->json(['data' => ['queued' => true]], 202);
    }
}
