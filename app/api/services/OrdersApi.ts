import { PrivateApiClient } from "../core/PrivateApiClient";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { OrderCreateRequest, OrderResponse, OrderListResponse } from "../types/orders";

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

    public getOrder(
        orderId: Id
    ): Promise<OrderResponse> {
        return this.api.get<OrderResponse>(
            `/orders/${orderId}`
        );
    }

    public createOrder(
        data: OrderCreateRequest,
    ): Promise<OrderResponse> {
        return this.api.post<OrderResponse>(
            "/orders",
            data,
        );
    }
}
