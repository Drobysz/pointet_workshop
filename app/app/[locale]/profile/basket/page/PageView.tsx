"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext, useEffect } from "react";
import s from "./style.module.scss";

import {
    CheckoutSection,
    Header,
    BasketList,
    ErrorTitle,
} from "./_sections";

import { Loading } from "./_components";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const PageView = ()=> {
    const t = useTranslations("checkout.notifications");
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
            text: t("paymentFailed")
        });

        const params = new URLSearchParams(searchParams);
        params.delete("preorder");

        // cleaning of url search params
        const query = params.toString();
        window.history.replaceState(
            null,
            "",
            window.location.pathname + (query ? `?${query}` : "")
        );
    }, [isPaymentFailed, searchParams, setNotification, t]);

    return (
        <div className="px-5 max-md:px-3 flex flex-col gap-5">
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
                        {basketLength > 0 &&
                            <CheckoutSection 
                                basketList={basketList}
                            />
                        }
                        
                        {(!isDataLoaded || basketLength < 1) &&
                            <ErrorTitle 
                                basketError={basketError}
                                basketLength={basketLength}
                            />
                        }
                    </>
                )}
            </div>
        </div>
    )
}
