"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { ShopContextInterface } from "./shop.interface";
import { Category } from "@/api/types/category";
import { GoodListParams } from "@/api/types/goods";
import { Subcategory } from "@/api/types/subcategory";
import { useSearchParams } from "next/navigation";
import { PathService } from "@/helpers";
import { useRouter } from "@/i18n/navigation";
import useSWR from "swr";
import { categoryApi } from "@/api/api";

export const ShopContext = createContext<ShopContextInterface>({
    categories: [],
    goodFilterParams: {},
    areGoodsLoading: false,

    setCurrentCategory: ()=> {},
    setCurrentSubcategory: ()=> {},
    setGoodFilterParams: ()=> {},
});

export const ShopContextProvider = ({
    children,
    categories
}: {
    children: ReactNode;
    categories: Category[];
})=> {
    const searhParams = useSearchParams();
    const router = useRouter();

    const [
        goodFilterParams, 
        setGoodFilterParams
    ] = useState<GoodListParams>({
       ...(searhParams.has("min_price") && {
            min_price: Number(searhParams.get("min_price")),
        }),

        ...(searhParams.has("max_price") && {
            max_price: Number(searhParams.get("max_price")),
        }),

        category_id: searhParams.get("category_id")
            ? Number(searhParams.get("category_id"))
            : categories[0].id,

        subcategory_id: searhParams.get("subcategory_id")
            ? Number(searhParams.get("subcategory_id"))
            : categories[0].subcategories![0].id,

        page: Number(searhParams.get("page") ?? 1),
        per_page: 9
    });

    const {
        isLoading: areGoodsLoading,
        error: goodsError,
        data: goodsPagination,
        mutate: mutateGoods
    } = useSWR(
        "goods",
        async ()=> {
            return await categoryApi.getGoods(
                goodFilterParams
            );
        },
        {
            refreshInterval: 10 * 60 * 1000,
            dedupingInterval: 10 * 60 * 1000,
            shouldRetryOnError: (error) => error?.status !== 401,
        }
    );

    const currentCategory: Category = categories.find(
        c => c.id === goodFilterParams.category_id
    ) ?? categories[0];

    const currentSubcategory: Subcategory = currentCategory.subcategories!.find(
        sc => sc.id === goodFilterParams.subcategory_id
    ) ?? currentCategory.subcategories![0];

    const setCurrentCategory = (categoryId: number)=> {
        setGoodFilterParams(p => ({
            ...p,
            category_id: categoryId,
        }));
    };

    const setCurrentSubcategory = (subcategoryId: number)=> {
        setGoodFilterParams(p => ({
            ...p,
            subcategory_id: subcategoryId,
        }));
    };

    useEffect(()=> {
        const paramsStringified 
            = PathService.paramsToString(goodFilterParams);

        mutateGoods();
        router.push(`/shop?${paramsStringified}`);
    }, [goodFilterParams, router, mutateGoods]);

    return (
        <ShopContext.Provider
            value={{
                categories: categories,

                areGoodsLoading: areGoodsLoading,
                goodsError: goodsError,
                goodsPagination: goodsPagination,

                currentCategory: currentCategory,
                currentSubcategory: currentSubcategory,
                goodFilterParams: goodFilterParams,

                setCurrentCategory,
                setCurrentSubcategory,
                setGoodFilterParams,
                mutateGoods,
            }}
        >
            {children}
        </ShopContext.Provider>
    )
}
