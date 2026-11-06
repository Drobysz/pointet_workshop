import { LocalBasketService } from "@/helpers/basket";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { BasketCreateRequest, BasketListResponse, BasketUpdateRequest } from "../types/basket";

/** Client-side cookie storage plus server-side inventory reconciliation for guests. */
export class GuestBasketApi {
    constructor(private readonly api: PublicApiClient) {}

    public async getBasket(): Promise<BasketListResponse> {
        const items = LocalBasketService.get();
        
        if (!items.length) {
            return { data: [] };
        }

        const response = await this.api.post<BasketListResponse>(
            "/basket/validate", 
            { items }
        );

        // A late response must not restore a basket cleared after payment.
        if (JSON.stringify(LocalBasketService.get()) !== JSON.stringify(items)) {
            return this.getBasket();
        }

        LocalBasketService.reconcile(response.data);
        return response;
    }

    public async addItem(data: BasketCreateRequest): Promise<BasketListResponse> {
        LocalBasketService.update(data);
        return this.getBasket();
    }

    public async updateItem(inventoryId: Id, data: BasketUpdateRequest): Promise<BasketListResponse> {
        LocalBasketService.updateQuantity(inventoryId, data.quantity);
        return this.getBasket();
    }

    public async deleteItem(inventoryId: Id): Promise<BasketListResponse> {
        LocalBasketService.remove(inventoryId);
        return this.getBasket();
    }

    public clearBasket(): void {
        LocalBasketService.clear();
    }
}
