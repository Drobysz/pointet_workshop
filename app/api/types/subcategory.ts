// ============================================================
// Subcategories
// ============================================================

import { ApiResponse, Id, PaginatedResponse, PaginationParams, SearchQueryParams } from "./api";
import { Category } from "./category";

export interface Subcategory {
    id: Id;
    name: string;
    category_id: Id;

    /**
     * Present when parent category relationship is loaded.
     */
    category?: Category;
}

export type SubcategoryResponse =
    ApiResponse<Subcategory>;

export type SubcategoryPage =
    PaginatedResponse<Subcategory>;

export interface SubcategoryListParams
    extends PaginationParams,
        SearchQueryParams {}
