"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext, useEffect } from "react";
import s from "./style.module.scss";

import {
    CheckoutSection,
    Header,
    BasketList,
} from "./_sections";

import { Loading } from "./_components";
import { useSearchParams } from "next/navigation";

export const PageView = ()=> {
    const { 
        basketList,
        basketError,
        isBasketLoading,

        setNotification
    } = useContext(GlobalContext);

    const isDataLoaded = basketList && !basketError;
    const basketLength = basketList?.length ?? 0;

    const searchParams = useSearchParams();

    const preorder = searchParams.get("preorder");
    const isPaymentFailed = preorder == "cancelled";

    useEffect(() => {
        if (!isPaymentFailed) return;

        setNotification({
            status: "error",
            text: "Payment failed"
        });

        const params = new URLSearchParams(searchParams);
        params.delete("preorder");

        const query = params.toString();
        window.history.replaceState(
            null,
            "",
            window.location.pathname + (query ? `?${query}` : "")
        );
    }, [isPaymentFailed, searchParams, setNotification]);

    return (
        <div className="px-5 flex flex-col gap-5">
            <Header 
                basketLength={basketLength}
            />

            <div className={s.flex_split}>
                {isBasketLoading && <Loading />}
                {isDataLoaded && (
                    <>
                        <BasketList 
                            basketList={basketList}
                        />
                        <CheckoutSection 
                            basketList={basketList}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
