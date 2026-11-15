import { PrivateApiClient } from "../core/PrivateApiClient";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { OrderCheckoutSessionResponse, OrderCreateRequest, OrderDetailResponse, OrderListResponse } from "../types/orders";

export class OrdersApi {
    constructor (
        private readonly api: PrivateApiClient,
        private readonly publicApi: PublicApiClient,
    ) {}

    public getOrders(
        // 
    ): Promise<OrderListResponse> {
        return this.api.get<OrderListResponse>(
            "/orders"
        );
    }

    public getGuestOrders(): Promise<OrderListResponse> {
        return this.publicApi.get<OrderListResponse>("/orders/guest");
    }

    public getGuestOrder(orderId: Id): Promise<OrderDetailResponse> {
        return this.publicApi.get<OrderDetailResponse>(`/orders/guest/${orderId}`);
    }

    public getOrder(
        orderId: Id
    ): Promise<OrderDetailResponse> {
        return this.api.get<OrderDetailResponse>(
            `/orders/${orderId}`
        );
    }

    /**
     * Creates a Stripe checkout session for the basket and returns the payment
     * page URL. Works for guests and authenticated users.
     */
    public createOrder(
        data: OrderCreateRequest,
    ): Promise<OrderCheckoutSessionResponse> {
        return this.publicApi.post<OrderCheckoutSessionResponse>(
            "/orders",
            data,
        );
    }
}
