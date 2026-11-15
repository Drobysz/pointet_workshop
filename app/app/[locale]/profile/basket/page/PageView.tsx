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

    // SWR keeps the last good basket while a refresh fails. Do not tear the list and
    // the checkout form down (and lose the typed contact details) because of that.
    const isDataLoaded = basketList !== undefined;
    const basketLength = basketList?.length ?? 0;

    const searchParams = useSearchParams();

    // Pre-order checkouts return with ?preorder=cancelled, order checkouts with ?order=cancelled.
    const cancelledParam = searchParams.get("order") === "cancelled"
        ? "order"
        : searchParams.get("preorder") === "cancelled"
            ? "preorder"
            : null;

    useEffect(() => {
        if (!cancelledParam) return;

        setNotification({
            status: "error",
            text: t("paymentFailed")
        });

        const params = new URLSearchParams(searchParams);
        params.delete(cancelledParam);

        // cleaning of url search params
        const query = params.toString();
        window.history.replaceState(
            null,
            "",
            window.location.pathname + (query ? `?${query}` : "")
        );
    }, [cancelledParam, searchParams, setNotification, t]);

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
                    </>
                )}
                {((!isDataLoaded && basketError) || (isDataLoaded && basketLength < 1)) &&
                    <ErrorTitle 
                        basketError={basketError}
                        basketLength={basketLength}
                    />
                }
            </div>
        </div>
    )
}
