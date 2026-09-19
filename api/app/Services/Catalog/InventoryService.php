<?php

namespace App\Services\Catalog;

use App\Models\Good;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public const MAX_QUANTITY = 2147483647;

    /** Caller must hold the product row lock inside a transaction. */
    public function replace(Good $good, array $rows): void
    {
        $existing = $good->inventory()->get()->keyBy('id');
        // Retain stable IDs if a client sends an existing natural key without its ID.
        $byVariant = $existing->keyBy(fn ($row) => $row->color_id.'|'.mb_strtolower($row->size ?? ''));
        foreach ($rows as &$row) {
            if (! isset($row['id'])) {
                $matched = $byVariant->get($row['color_id'].'|'.mb_strtolower($row['size'] ?? ''));
                if ($matched) {
                    $row['id'] = $matched->id;
                    $row['size'] = $matched->size;
                }
            }
        }
        unset($row);
        $kept = [];
        $colorIds = array_unique(array_column($rows, 'color_id'));
        abort_if($good->images()->whereNotIn('color_id', $colorIds)->exists(), 409, 'Remove images before removing the last inventory row for their color.');
        $total = array_sum(array_column($rows, 'quantity'));
        if ($total > self::MAX_QUANTITY) {
            throw ValidationException::withMessages(['inventory' => 'Total stock exceeds the supported maximum.']);
        }
        // Existing row identity is immutable: historic baskets must never change variant silently.
        foreach ($rows as $index => $row) {
            $size = $row['size'] ?? null;
            if (isset($row['id'])) {
                $record = $existing->get($row['id']);
                if (! $record || $record->color_id != $row['color_id'] || $record->size !== $size) {
                    throw ValidationException::withMessages(["inventory.{$index}.id" => 'Existing inventory color and size cannot be changed; add a new row instead.']);
                }
                $record->update(['quantity' => $row['quantity']]);
                $kept[] = $record->id;
            }
        }
        $good->inventory()->whereNotIn('id', $kept)->delete();
        foreach ($rows as $row) {
            if (! isset($row['id'])) {
                $good->inventory()->create(collect($row)->only(['color_id', 'size', 'quantity'])->all());
            }
        }
        $good->forceFill(['current_quantity' => $total, 'inventory_version' => $good->inventory_version + 1])->save();
    }
}
