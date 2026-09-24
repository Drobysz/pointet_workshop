// ============================================================
// Goods
// ============================================================

import { ApiResponse, Id, PaginatedResponse, PaginationParams, SearchQueryParams } from "./api";
import { ProductColor } from "./colors";
import { Subcategory } from "./subcategory";
import { Category } from "./category";
import { InventoryRow } from "./inventory";
import { Material } from "./material";

export interface Good {
    id: Id;
    name: string;

    /**

     * Decimal value returned by API as a string.

     * Example: "125.00"

     */
    price: string;

    current_quantity: number;
    inventory_version: number;
    inventory: InventoryRow[];
    description: string;
    category_id: Id;
    subcategory_id: Id;
    category: Category;
    subcategory: Subcategory;
    materials: Material[];
    colors: ProductColor[];
    created_at: string | null;
}

export type GoodResponse =
    ApiResponse<Good>;

export type GoodPage =
    PaginatedResponse<Good>;

export interface GoodListParams
    extends PaginationParams,
        SearchQueryParams {
    category_id?: Id;
    subcategory_id?: Id;
    min_price?: number;
    max_price?: number;
}
