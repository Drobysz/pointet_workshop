import { PathService } from "@/helpers";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { CategoryList } from "../types/category";
import { GoodListParams, GoodPage, GoodResponse } from "../types/goods";

export class CategoryApi {
    constructor (
        private readonly api: PublicApiClient,
    ) {}

    public getCategories (): Promise<CategoryList> {
        return this.api.get<CategoryList>("/categories");
    }

    public getGoods (
        params?: GoodListParams,
    ): Promise<GoodPage> {
        const urlParams = PathService.paramsToString(params ?? {});
        const endpoint = params
            ? `/goods?${urlParams}`
            : "/goods";

        return this.api.get<GoodPage>(endpoint);
    }

    public getGood (
        goodId: Id,
    ): Promise<GoodResponse> {
        return this.api.get<GoodResponse>(
            `/goods/${goodId}`
        );
    }

    public async getAllGoods() {
        const firstPage = await this.getGoods({
            page: 1,
            per_page: 30,
        });
    
        const remainingPageNumbers = Array.from(
            {
                length: firstPage.meta.last_page - 1,
            },
            (_, index) => index + 2,
        );
    
        const remainingPages = await Promise.all(
            remainingPageNumbers.map((page) => {
                return this.getGoods({
                    page,
                    per_page: 100,
                });
            }),
        );
    
        return [
            ...firstPage.data,
            ...remainingPages.flatMap((page) => page.data),
        ];
    }
}
