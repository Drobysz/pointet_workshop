"use client";

import { useContext } from "react";
import { ShopContext } from "./context/shop.context";
import {
    Loading,
    ErrorTitle,
    Cards,
    PagesPagination,
} from "./_components";
import s from "./style.module.scss";

export default function ShopPage () {
    const {
        areGoodsLoading,
        goodsError,
        goodsPagination
    } = useContext(ShopContext);

    console.log(goodsPagination)

    const isEmpty = goodsPagination && goodsPagination.data.length < 1;

    return (
        <section className={s.goods_container}>
            {areGoodsLoading && <Loading />}
            {goodsError && 
                <ErrorTitle>
                    Faield to load
                </ErrorTitle>
            }
            {goodsPagination && (
                <>
                    {isEmpty && 
                        <ErrorTitle>
                            No goods in disposition
                        </ErrorTitle>
                    }
                    <Cards goods={goodsPagination.data} />
                    <PagesPagination />
                </>
            )}

        </section>
    )
}
