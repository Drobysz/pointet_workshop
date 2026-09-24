// ============================================================
// Orders
// ============================================================

import { ApiResponse, Id, PaginatedResponse } from "./api";
import { User } from "./user";

export type OrderStatus =
    | "processing"
    | "sent"
    | "delivered"
    | "reported"
    | "cancelled";

export interface Order {
    id: Id;

    user_id: Id | null;

    customer_name: string;
    customer_email: string;

    status: OrderStatus;

    placed_at: string | null;

    /**
     * Decimal comes as string.
     */
    total: string;
}

export interface OrderItem {
    id: Id;

    good_id: Id | null;

    product_name: string;
    color_name: string | null;
    size: string | null;

    good_register_id: Id | null;

    unit_price: string;

    quantity: number;

    line_total: string;

    status: OrderStatus;
}

export interface OrderDetail extends Order {
    customer: User | null;
    items: OrderItem[];
}

export type OrderResponse =
    ApiResponse<Order>;

export type OrderDetailResponse =
    ApiResponse<OrderDetail>;

export type OrderPage =
    PaginatedResponse<Order>;

export interface OrderLineRequest {
    good_register_id: Id;
    quantity: number;
}

export interface OrderCreateRequest {
    items: OrderLineRequest[];
}

export interface OrderUpdateRequest {
    status: OrderStatus;
}
