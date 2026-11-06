import { PrivateApiClient } from "../core/PrivateApiClient";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { OrderCreateRequest, OrderDetailResponse, OrderResponse, OrderListResponse } from "../types/orders";

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

    public createOrder(
        data: OrderCreateRequest,
    ): Promise<OrderResponse> {
        return this.api.post<OrderResponse>(
            "/orders",
            data,
        );
    }
}
