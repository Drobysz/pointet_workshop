// ============================================================
// Colors
// ============================================================

import { ApiResponse, Id, PaginatedResponse, PaginationParams, SearchQueryParams } from "./api";
import { ProductImage } from "./productImages";

export interface Color {
    id: Id;
    name: string;
    hexcode: string;
}

export interface ProductColor extends Color {
    images: ProductImage[];
}

export type ColorResponse =
    ApiResponse<Color>;

export type ColorPage =
    PaginatedResponse<Color>;

export interface ColorListParams
    extends PaginationParams,
        SearchQueryParams {}
