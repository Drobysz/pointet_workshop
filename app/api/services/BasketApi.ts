import { PrivateApiClient } from "../core/PrivateApiClient";
import { Id } from "../types/api";
import {
    BasketCreateRequest,
    BasketListResponse,
    BasketResponse,
    BasketUpdateRequest
} from "../types/basket";

export class BasketApi {
    constructor (
        private readonly api: PrivateApiClient,
    ) {}

    public getBasket(): Promise<BasketListResponse> {
        return this.api.get<BasketListResponse>(
            "/basket",
        );
    }

    public addItem (
        data: BasketCreateRequest,
    ): Promise<BasketResponse> {
        return this.api.post<BasketResponse>(
            "/basket",
            data
        )
    }

    public updateItem(
        id: Id,
        data: BasketUpdateRequest,
    ): Promise<BasketResponse> {
        return this.api.patch<BasketResponse>(
            `/basket/${id}`, data
        );
    }

    public deleteItem(
        id: Id,
    ): Promise<void> {
        return this.api.delete<void>(
            `/basket/${id}`,
        );
    }
}
