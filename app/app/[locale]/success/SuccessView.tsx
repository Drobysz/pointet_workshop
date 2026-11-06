"use client";

import { basketApi, stripeApi } from "@/api/api";
import { Skeleton } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { GlobalContext } from "../context/global.context";
import { LocalBasketService } from "@/helpers/basket";
import { statusMessages } from "./helpers";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SuccessView() {
    const t = useTranslations("checkout");
    const router = useRouter();
    const { mutate: mutateCache } = useSWRConfig();
    const [clearedSessionId, setClearedSessionId] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const { 
        data, 
        error, 
        isLoading,
    } = useSWR(
        sessionId ? ["stripe-checkout-session", sessionId] : null,
        ([, id]) => stripeApi.getCheckoutSession(id),
        {
            refreshInterval: (response) => {
                return response?.data.payment_status === "pending" ? 2000 : 0
            }
        },
    );
    const paymentStatus = data?.data.payment_status;
    const {
        authStatus,

        setNotification,
        mutateBasket 
    } = useContext(GlobalContext);

    useEffect(() => {
        if (!sessionId ||
            paymentStatus !== "paid" ||
            authStatus === "loading" ||
            clearedSessionId === sessionId
        ) return;

        let active = true;

        const clearBasket = async () => {
            try {
                if (authStatus === "unauthenficated") {
                    LocalBasketService.clear();
                } else {
                    await basketApi.clearBasket();
                }

                await mutateBasket([], { revalidate: false });
                // Invalidate catalog stock even while the shop is unmounted.
                await mutateCache("goods", undefined);

                if (active) {
                    setClearedSessionId(sessionId);
                }
            } catch {
                if (active) {
                    setNotification({
                        status: "error",
                        text: t("notifications.basketNotCleared"),
                    });
                }
            }
        };

        clearBasket();

        return () => {
            active = false;
        };
    }, [
        sessionId, paymentStatus, authStatus, clearedSessionId,
        mutateBasket, mutateCache, setNotification, t,
    ]);

    useEffect(() => {
        if (!sessionId || 
            paymentStatus !== "paid" || 
            clearedSessionId !== sessionId
        ) return;

        const timeout = setTimeout(() => {
            router.push("/profile/preorders");
        }, 3000);

        return () => clearTimeout(timeout);
    }, [sessionId, paymentStatus, clearedSessionId, router]);

    if (sessionId && !isLoading && (error || !paymentStatus)) {
        return (
            <main className={s.payment_confirmation}>
                <h1 className={cn(
                    "text-2xl font-bold",
                    jersey10.className
                )}>
                    {t("result.unverified.title")}
                </h1>
                <p>{t("result.unverified.body")}</p>
            </main>
        )
    }

    const message = paymentStatus ? statusMessages[paymentStatus] : undefined;

    return (
        <main className={s.payment_confirmation}>
            {!sessionId && (
                <>
                    <h1 className={cn(
                        "text-2xl font-bold text-orange-400",
                        jersey10.className
                    )}>
                        {t("result.missingSession.title")}
                    </h1>
                    <p className="text-orange-400">
                        {t("result.missingSession.body")}
                    </p>
                </>
            )}

            {isLoading && 
                <Skeleton
                    width={30}
                    height={30}
                    color="inherit"
                />
            }

            {message && (
                <>
                    <h1 className={cn(
                        "text-5xl font-bold text-green-600",
                        jersey10.className
                    )}>
                        {t(message.title)}
                    </h1>
                    <Link
                        href="/profile/preorders"
                        className="hover:underline text-green-600"
                    >
                        {t("result.viewPreorders")}
                    </Link>
                </>
            )}
        </main>
    );
}
