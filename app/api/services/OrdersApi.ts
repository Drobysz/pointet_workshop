import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { OrderCreateRequest, OrderPage, OrderResponse } from "../types/orders";

export class OrdersApi {
    constructor (
        private readonly api: PublicApiClient,
    ) {}

    public getOrders(
    ): Promise<OrderPage> {
        return this.api.get<OrderPage>(
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
