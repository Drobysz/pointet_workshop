// ============================================================
// Inventory
// ============================================================

import { Id } from "./api";

export interface InventoryRow {
    id: Id;
    good_id: Id;
    color_id: Id;
    size: string | null;
    quantity: number;
}

export interface InventoryInput {
    color_id: Id;
    size?: string | null;
    quantity: number;
}
