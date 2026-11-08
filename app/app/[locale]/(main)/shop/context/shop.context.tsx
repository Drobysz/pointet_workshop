"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { ShopContextInterface } from "./shop.interface";
import { Category } from "@/api/types/category";
import { GoodListParams } from "@/api/types/goods";
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
    const searchParams = useSearchParams();
    const router = useRouter();

    const [
        goodFilterParams, 
        setGoodFilterParams
    ] = useState<GoodListParams>(() => {
        const categoryId = Number(searchParams.get("category_id"));
        const category = categories.find(item => item.id === categoryId)
            ?? categories[0];
        const subcategories = category?.subcategories ?? [];
        const subcategoryParam = searchParams.get("subcategory_id");
        const subcategory = subcategories.find(item => item.id === Number(subcategoryParam))
            ?? subcategories[0];

        return {
            ...(searchParams.has("min_price") && {
                min_price: Number(searchParams.get("min_price")),
            }),
            ...(searchParams.has("max_price") && {
                max_price: Number(searchParams.get("max_price")),
            }),
            category_id: category?.id,
            subcategory_id: category && subcategoryParam === "0" ? 0 : subcategory?.id,
            page: Number(searchParams.get("page") ?? 1),
            per_page: 9,
        };
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

    const currentCategory = categories.find(
        c => c.id === goodFilterParams.category_id
    ) ?? categories[0];

    const currentSubcategories = currentCategory?.subcategories ?? [];
    const currentSubcategory = currentSubcategories.find(
        sc => sc.id === goodFilterParams.subcategory_id
    ) ?? currentSubcategories[0];

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
