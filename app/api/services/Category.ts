import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { CategoryPage } from "../types/category";
import { GoodListParams, GoodPage, GoodResponse } from "../types/goods";

export class CategoryApi {
    constructor (
        private readonly api: PublicApiClient,
    ) {}

    public getCategories (): Promise<CategoryPage> {
        return this.api.get("/categories")
    }

    public getGoods (
        params?: GoodListParams,
    ): Promise<GoodPage> {
        return this.api.post<GoodPage>(
            "/goods",
            params
        )
    }

    public getGood (
        goodId: Id,
    ): Promise<GoodResponse> {
        return this.api.get(
            `/goods/${goodId}`
        )
    }
}
