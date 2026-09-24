<?php

namespace App\Http\Controllers;

use App\Http\Resources\GoodResource;
use App\Models\Good;
use App\Models\GoodRegister;
use App\Services\Catalog\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function restock(Request $request, Good $good, GoodRegister $register): GoodResource
    {
        abort_unless($register->good_id === $good->id, 404);
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:'.InventoryService::MAX_QUANTITY]]);
        $good = DB::transaction(function () use ($good, $register, $data): Good {
            $good = Good::query()->lockForUpdate()->findOrFail($good->id);
            $row = $good->inventory()->lockForUpdate()->findOrFail($register->id);
            abort_if($good->current_quantity + $data['quantity'] > InventoryService::MAX_QUANTITY, 422, 'Total stock exceeds the supported maximum.');
            $row->increment('quantity', $data['quantity']);
            $good->forceFill(['current_quantity' => $good->current_quantity + $data['quantity'], 'inventory_version' => $good->inventory_version + 1])->save();

            return $good;
        });

        return new GoodResource($good->load([
            'category.image',
            'subcategory',
            'colors',
            'materials',
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'inventory',
        ]));
    }
}
