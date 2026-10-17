import { BasketCreateRequest } from "@/api/types/basket";
import { CookiesService } from "./cookies";

export class LocalBasketService {
    static update(params: BasketCreateRequest) {
        const cookies = new CookiesService();

        cookies.setJSONCookie<BasketCreateRequest>(
            "pointet-basket",
            params,
            30
        );
    }

    static clear() {
        const cookies = new CookiesService();

        cookies.deleteCookie("pointet-basket");
    }
}