// ============================================================
// Product images
// ============================================================

import { ApiResponse, Id } from "./api";

export interface ProductImage {
    id: Id;
    name: string;
    path: string;
    url: string | null;
    sort_order: number;
}

export type ProductImageResponse =
    ApiResponse<ProductImage>;
