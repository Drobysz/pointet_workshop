// ============================================================
// Basket
// ============================================================

import { ApiResponse, Id } from "./api";
import { Color } from "./colors";
import { Good } from "./goods";
import { InventoryRow } from "./inventory";

export interface BasketItem {
    id: Id;
    good_register_id: Id | null;
    inventory: InventoryRow | null;
    quantity: number;
    good: Good;
    color: Color | null;
}

// ============================================================
// Responses
// ============================================================

export type BasketResponse =
    ApiResponse<BasketItem>;

export type BasketListResponse =
    ApiResponse<BasketItem[]>;

// ============================================================
// Requests
// ============================================================

export interface BasketCreateRequest {
    good_register_id: Id;
    quantity: number;
}

export interface BasketUpdateRequest {
    quantity: number;
}
