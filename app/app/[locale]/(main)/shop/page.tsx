"use client";

import { useContext } from "react";
import { useTranslations } from "next-intl";
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

    const t = useTranslations();

    const isEmpty = goodsPagination && goodsPagination.data.length < 1;

    return (
        <section className={s.goods_container}>
            {areGoodsLoading && <Loading />}
            {goodsError && 
                <ErrorTitle>
                    {t("common.states.loadFailed")}
                </ErrorTitle>
            }
            {goodsPagination && (
                <>
                    {isEmpty && 
                        <ErrorTitle>
                            {t("catalog.states.empty")}
                        </ErrorTitle>
                    }
                    <Cards goods={goodsPagination.data} />
                    <PagesPagination />
                </>
            )}

        </section>
    )
}
