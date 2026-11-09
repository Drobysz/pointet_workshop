import { PathService } from "@/helpers";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { CategoryList } from "../types/category";
import { GoodListParams, GoodPage, GoodResponse } from "../types/goods";

const ALL_GOODS_PAGE_SIZE = 100;

/**
 * Catalog labels come back localized. Server components must pass the page
 * locale, as there is no document to read it from; browser calls send the
 * current `<html lang>` automatically.
 */
function localeHeaders(locale?: string): Record<string, string> | undefined {
    return locale ? { "Accept-Language": locale } : undefined;
}

export class CategoryApi {
    constructor (
        private readonly api: PublicApiClient,
    ) {}

    public getCategories (
        locale?: string,
    ): Promise<CategoryList> {
        return this.api.get<CategoryList>(
            "/categories",
            false,
            localeHeaders(locale),
        );
    }

    public getGoods (
        params?: GoodListParams,
        locale?: string,
    ): Promise<GoodPage> {
        const urlParams = PathService.paramsToString(params ?? {});
        const endpoint = params
            ? `/goods?${urlParams}`
            : "/goods";

        return this.api.get<GoodPage>(endpoint, false, localeHeaders(locale));
    }

    public getGood (
        goodId: Id,
        locale?: string,
    ): Promise<GoodResponse> {
        return this.api.get<GoodResponse>(
            `/goods/${goodId}`,
            false,
            localeHeaders(locale),
        );
    }

    /**
     * Every page must be requested with the same size: `last_page` of
     * the first response is only valid for that page size.
     */
    public async getAllGoods() {
        const firstPage = await this.getGoods({
            page: 1,
            per_page: ALL_GOODS_PAGE_SIZE,
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
                    per_page: ALL_GOODS_PAGE_SIZE,
                });
            }),
        );
    
        return [
            ...firstPage.data,
            ...remainingPages.flatMap((page) => page.data),
        ];
    }
}
