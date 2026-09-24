// ============================================================
// Categories
// ============================================================

import { ApiResponse, Id, PaginatedResponse, PaginationParams, SearchQueryParams } from "./api";
import { Subcategory } from "./subcategory";

export interface CategoryImage {
    id: Id;
    name: string;
    path: string;
    url: string | null;
}

export interface Category {
    id: Id;
    name: string;

    image_id: Id | null;

    /**
     * Present when relationship is loaded.
     */
    image?: CategoryImage | null;

    /**
     * Present when relationship is loaded.
     */
    subcategories?: Subcategory[];
}

export type CategoryResponse =
    ApiResponse<Category>;

export type CategoryPage =
    PaginatedResponse<Category>;

export interface CategoryListParams
    extends PaginationParams,
        SearchQueryParams {}
