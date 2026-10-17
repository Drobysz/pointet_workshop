import { Category } from "@/api/types/category";
import { GoodListParams, GoodPage } from "@/api/types/goods";
import { Subcategory } from "@/api/types/subcategory";
import { Dispatch, SetStateAction } from "react";
import { KeyedMutator } from "swr";

export interface ShopContextInterface {
    categories: Category[];

    areGoodsLoading: boolean;
    goodsError?: Error;
    goodsPagination?: GoodPage;
    mutateGoods?: KeyedMutator<GoodPage>;
    
    currentCategory?: Category;
    currentSubcategory?: Subcategory;
    goodFilterParams: GoodListParams;

    setCurrentCategory: (categoryId: number)=> void;
    setCurrentSubcategory: (subcategoryId: number)=> void;
    setGoodFilterParams: Dispatch<SetStateAction<GoodListParams>>;
}
