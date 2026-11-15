<?php

namespace App\Services\Checkout;

use App\Models\Good;
use App\Models\GoodRegister;

class InventoryDeduction
{
    /**
     * Atomically takes stock for every line or aborts with 422. Must be called
     * inside a transaction so a failed line rolls the whole batch back.
     *
     * @param array<int, array{good_id: int, good_register_id: int, quantity: int}> $items
     */
    public function deduct(array $items): void
    {
        // Match all other stock writers: lock products first, then inventory rows.
        $goods = Good::query()
            ->whereIn('id', array_column($items, 'good_id'))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');
        $variants = GoodRegister::query()
            ->whereIn('id', array_column($items, 'good_register_id'))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

        foreach ($items as $item) {
            $good = $goods->get($item['good_id']);
            $variant = $variants->get($item['good_register_id']);
            $quantity = (int) $item['quantity'];
            abort_unless($good && $variant && $variant->good_id === $good->id && $quantity > 0, 422, 'This inventory selection is no longer available.');
            abort_if($quantity > $variant->quantity, 422, "Insufficient inventory for {$good->name} in the selected color and size.");
            $variant->decrement('quantity', $quantity);
        }

        foreach ($goods as $good) {
            $good->forceFill([
                'current_quantity' => $good->inventory()->sum('quantity'),
                'inventory_version' => $good->inventory_version + 1,
            ])->save();
        }
    }
}
