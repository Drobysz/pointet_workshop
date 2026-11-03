<?php

namespace App\Services\Checkout;

use App\Http\Resources\BasketResource;
use App\Models\Basket;
use App\Models\GoodRegister;
use Illuminate\Support\Collection;

class GuestBasketService
{
    public const MAX_ITEMS = 20;
    public const MAX_QUANTITY = 99;

    private const RELATIONS = ['good.subcategory', 'good.colors', 'good.inventory', 'good.images', 'color'];

    /**
     * Normalises untrusted cookie/request lines and returns only sellable variants.
     * The returned Basket models are in-memory resource adapters; no basket rows are
     * ever created for guests.
     *
     * @param array<int, array{inventory_id: int, quantity: int}> $items
     * @return Collection<int, Basket>
     */
    public function validatedItems(array $items): Collection
    {
        $quantities = [];
        foreach (array_slice($items, 0, self::MAX_ITEMS) as $item) {
            $id = (int) ($item['inventory_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);
            if ($id < 1 || $quantity < 1) {
                continue;
            }
            $quantities[$id] = min(self::MAX_QUANTITY, ($quantities[$id] ?? 0) + $quantity);
        }
        if ($quantities === []) {
            return collect();
        }

        $variants = GoodRegister::query()
            ->with(self::RELATIONS)
            ->whereIn('id', array_keys($quantities))
            ->where('quantity', '>', 0)
            ->whereHas('good', fn ($query) => $query->where('visible', true))
            ->get()
            ->keyBy('id');

        return collect($quantities)
            ->map(function (int $requested, int $inventoryId) use ($variants): ?Basket {
                /** @var GoodRegister|null $variant */
                $variant = $variants->get($inventoryId);
                if (! $variant || ! $variant->good || ! $variant->color) {
                    return null;
                }

                $basket = new Basket([
                    // A guest item's public id is deliberately its inventory id,
                    // never an authenticated basket-row id.
                    'good_register_id' => $variant->id,
                    'good_id' => $variant->good_id,
                    'color_id' => $variant->color_id,
                    'quantity' => min($requested, $variant->quantity),
                ]);
                $basket->forceFill(['id' => $variant->id]);
                $basket->setRelation('inventory', $variant);
                $basket->setRelation('good', $variant->good);
                $basket->setRelation('color', $variant->color);

                return $basket;
            })
            ->filter()
            ->values();
    }

    /** @param array<int, array{inventory_id: int, quantity: int}> $items */
    public function resources(array $items)
    {
        return BasketResource::collection($this->validatedItems($items));
    }
}
