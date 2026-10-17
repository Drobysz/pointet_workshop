import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { OrderCreateRequest, OrderResponse, OrderListResponse } from "../types/orders";

export class OrdersApi {
    constructor (
        private readonly api: PublicApiClient,
    ) {}

    public getOrders(
        // 
    ): Promise<OrderListResponse> {
        return this.api.get<OrderListResponse>(
            "/orders"
        );
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
