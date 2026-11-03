import { ApiResponse, Id, PaginatedResponse, PaginationParams } from "./api";
import type { GuestBasketCookieItem } from "@/helpers/basket";
import { ProductImage } from "./productImages";

export type PreorderPaymentStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";

export interface PreorderRegister {
    id: Id;
    good_id: Id | null;
    good_register_id: Id | null;
    product_name: string;
    color_name: string | null;
    size: string | null;
    original_unit_price: string;
    quantity: number;
    images: ProductImage[];
}

export interface Preorder {
    id: Id;
    user_id: Id | null;
    customer_name: string;
    customer_email: string;
    payment_status: PreorderPaymentStatus;
    payment_amount_cents: number;
    currency: string;
    paid_at: string | null;
    created_at: string | null;
    checkout_url?: string;
    registers?: PreorderRegister[];
}

export interface PreorderCheckoutSession {
    id: Id;
    payment_status: PreorderPaymentStatus;
    payment_amount_cents: number;
    currency: string;
    paid_at: string | null;
    checkout_url?: string;
    preorder_id: Id | null;
}

export interface PreorderCreateRequest { 
    idempotency_key: string; 
    items?: GuestBasketCookieItem[]; 
}

export interface PreorderUpdateRequest { 
    payment_status: "canceled"; 
}

export interface PreorderListParams extends PaginationParams { 
    payment_status?: PreorderPaymentStatus; 
    search?: string; 
}

export type PreorderResponse = ApiResponse<Preorder>;
export type PreorderCheckoutSessionResponse = ApiResponse<PreorderCheckoutSession>;
export type PreorderListResponse = PaginatedResponse<Preorder>;
