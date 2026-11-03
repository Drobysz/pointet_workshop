import type { BasketCreateRequest, BasketItem } from "@/api/types/basket";
import type { Id } from "@/api/types/api";
import { CookiesService } from "./cookies";

export interface GuestBasketCookieItem {
    inventoryId: Id;
    quantity: number;
}

export interface UnknownGuestBasketCookieItem {
    inventoryId: unknown;
    quantity: unknown;
}

export class LocalBasketService {
    private static readonly cookieName = "pointet-guest-basket";
    private static readonly maxItems = 20;
    private static readonly maxQuantity = 10;

    static isBasketItemSave(
        basketItem: UnknownGuestBasketCookieItem
    ): boolean {
        const { inventoryId, quantity } = basketItem;

        if (typeof inventoryId !== "number" || 
            !Number.isSafeInteger(inventoryId) || 
            inventoryId < 0
        ) return false;
        
        if (typeof quantity !== "number" || 
            !Number.isSafeInteger(quantity) || 
            quantity < 1
        ) return false;

        return true;
    }

    static get(): GuestBasketCookieItem[] {
        const cookies = new CookiesService();
        const value = cookies.getJSONCookie<unknown>(this.cookieName);

        if (!Array.isArray(value)) {
            const isItem = cookies.getCookies(this.cookieName)

            if (isItem) {
                cookies.deleteCookie(this.cookieName);
            }
            
            return [];
        }

        const quantities = new Map<Id, number>();
        
        for (const item of value.slice(0, this.maxItems)) {
            if (!item || 
                typeof item !== "object"
            ) continue;

            const candidate = item as Record<string, unknown>;
            const { inventoryId, quantity } = candidate;
            
            if (typeof inventoryId !== "number" || 
                !Number.isSafeInteger(inventoryId) || 
                inventoryId < 0
            ) continue;

            if (typeof quantity !== "number" || 
                !Number.isSafeInteger(quantity) || 
                quantity < 1
            ) continue;

            quantities.set(
                inventoryId, 
                Math.min(
                    this.maxQuantity, 
                    (quantities.get(inventoryId) ?? 0) + quantity
                )
            );
        }

        const basketArray = Array.from(
            quantities, 
            ([inventoryId, quantity]) => ({ inventoryId, quantity })
        );

        return basketArray;
    }

    static set(items: GuestBasketCookieItem[]) {
        const cookies = new CookiesService();
        const normalized = items
            .filter(({ inventoryId, quantity }) => {
                return this.isBasketItemSave({ inventoryId, quantity })
            })
            .slice(0, this.maxItems)
            .map(({ inventoryId, quantity }) => ({ 
                inventoryId, 
                quantity: Math.min(quantity, this.maxQuantity) 
            }));

        if (!normalized.length) {
            cookies.deleteCookie(this.cookieName);
            return;
        }

        cookies.setJSONCookie<GuestBasketCookieItem[]>(
            this.cookieName, 
            normalized, 
            30
        );
    }

    static update(params: BasketCreateRequest) {
        const basketItems = this.get();
        const current = basketItems.find(item => item.inventoryId === params.good_register_id);

        if (current) {
            current.quantity = Math.min(
                this.maxQuantity, 
                current.quantity + params.quantity
            );
        } else if (basketItems.length < this.maxItems) {
            const newItem = { 
                inventoryId: params.good_register_id, 
                quantity: Math.min(params.quantity, this.maxQuantity) 
            }

            basketItems.push(newItem);
        }
        this.set(basketItems);
    }

    static updateQuantity(inventoryId: Id, quantity: number) {
        const updatedItem = { inventoryId, quantity };
        const basketItems = this.get();

        const updatedBasketItems = basketItems.map(
            item => item.inventoryId === inventoryId 
                ? updatedItem
                : item
        );

        this.set(updatedBasketItems);
    }

    static remove(inventoryId: Id) {
        const updatedBasketItems = this
            .get()
            .filter(
                item => item.inventoryId !== inventoryId
            );

        this.set(updatedBasketItems);
    }

    static reconcile(items: BasketItem[]) {
        const convertApiBasketItem = (item: BasketItem)=> {
            const inventoryId = item.good_register_id;
            const quantity = item.quantity

            if (inventoryId && quantity > 0) {
                return [{ inventoryId, quantity }]
            }

            return [];
        }

        const reconciledBasketItems = items.flatMap(
            item => convertApiBasketItem(item)
        );

        this.set(reconciledBasketItems);
    }

    static clear() {
        const cookies = new CookiesService();
        cookies.deleteCookie(this.cookieName);
    }
}
