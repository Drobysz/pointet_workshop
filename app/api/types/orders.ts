// ============================================================
// Orders
// ============================================================

import { ApiResponse, Id } from "./api";
import type { GuestBasketCookieItem } from "@/helpers/basket";
import type { PreorderPaymentStatus } from "./preorder";
import { User } from "./user";
import { ProductImage } from "./productImages";

export type OrderStatus =
    | "processing"
    | "sent"
    | "shipped"
    | "reported"
    | "cancelled";

export interface Order {
    id: Id;

    user_id: Id | null;

    /**
     * Total number of units across all items in the order.
     */
    quantity: number;

    customer_name: string;
    customer_email: string;
    /** Delivery address snapshot; null when none was provided. */
    customer_address: string | null;

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

    images: ProductImage[];
}

/**
 * Carrier tracking link added by an administrator. An order can have several;
 * the first one moves it to "sent".
 */
export interface OrderTrackingLink {
    id: Id;
    order_id: Id;
    tracking_url: string;
    /** ISO date of when the link was added. */
    created_at: string;
}

export interface OrderDetail extends Order {
    customer: User | null;
    items: OrderItem[];
    /** Tracking links in the order they were added; an empty array when there are none. */
    tracking_links: OrderTrackingLink[];
}

export type OrderResponse =
    ApiResponse<Order>;

export type OrderDetailResponse =
    ApiResponse<OrderDetail>;

export type OrderListResponse =
    ApiResponse<Order[]>;

/**
 * Starts a Stripe checkout for the whole basket. The order itself is created
 * by the API only after Stripe confirms the payment.
 */
export interface OrderCreateRequest {
    idempotency_key: string;
    /** Required for guests; authenticated checkouts use the account email. */
    email?: string;
    /** Optional recipient name for guests; accounts use their stored name. */
    full_name?: string;
    /** Optional delivery address for guests; accounts use their stored address. */
    address?: string;
    /** Guests send their cookie basket; authenticated checkouts use the stored basket. */
    items?: GuestBasketCookieItem[];
}

export interface OrderCheckoutSession {
    id: Id;
    payment_status: PreorderPaymentStatus;
    /** Full amount charged in minor units: goods plus delivery. */
    payment_amount_cents: number;
    /** Delivery part of the total: EUR 15 per distinct brand in the basket. */
    delivery_cents: number;
    currency: string;
    paid_at: string | null;
    /** Stripe-hosted payment page to redirect the customer to. */
    checkout_url?: string;
    /** Set once the webhook has created the order. */
    order_id: Id | null;
}

export type OrderCheckoutSessionResponse =
    ApiResponse<OrderCheckoutSession>;

export interface OrderUpdateRequest {
    status: OrderStatus;
}
