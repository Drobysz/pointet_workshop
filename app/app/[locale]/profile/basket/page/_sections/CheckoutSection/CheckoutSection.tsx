"use client";

import { BasketItem } from "@/api/types/basket";
import { preorderApi } from "@/api/api";
import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useContext, useState } from "react";
import s from "./style.module.scss";
import { Skeleton } from "@mui/material";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { LocalBasketService } from "@/helpers/basket";

export const CheckoutSection = ({
    basketList
}: {
    basketList: BasketItem[];
})=> {
    const { setNotification, authStatus } = useContext(GlobalContext);

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

    const startPreorder = async () => {
        if (!basketList.length || isPending) return;

        setIsPending(true);
        setError(null);

        try {
            const key = idempotencyKey ?? crypto.randomUUID();
            setIdempotencyKey(key);

            const response = await preorderApi.createPreorder({
                idempotency_key: key,
                ...(authStatus === "unauthenficated" ? { items: LocalBasketService.get() } : {}),
            });

            if (!response.data.checkout_url) {
                const message = "Payment session is unavailable."

                setNotification({ status: "error", text: message });
                throw new Error(message);
            }
            window.location.assign(response.data.checkout_url);
        } catch {
            const message = "Unable to start the pre-order payment. Please try again."

            setNotification({ status: "error", text: message })
            setError(message);
            setIsPending(false);
        }
    };

    return (
        <section className={s.checkout_sect}>
            <div className="flex gap-8 items-center">
                <div className={cn(
                    s.checkout_sect__total_price,
                    jersey10.className
                )}>
                    <span>
                        Total :
                    </span>

                    <span>
                        1.00€
                    </span>
                </div>

                <p className={s.checkout_sect__disclosure}>
                    This is a €1 pre-order only. 
                    We are currently collecting pre-orders. 
                    We set a conditional price of 1 euro in 
                    order to gather people who will definitely 
                    be ready to place an order. 
                    As soon as the goods arrive at the warehouse, 
                    we will notify you.
                </p>
            </div>

            {error && 
                <p 
                    className={s.error} 
                    role="alert"
                >
                    {error}
                </p>
            }
            <button 
                className={s.checkout_sect__preorderButton} 
                type="button" 
                disabled={isPending || !basketList.length || authStatus === "loading"} 
                onClick={() => void startPreorder()}
            >
                {isPending 
                    ? (
                        <Skeleton 
                            width={20} 
                            height={20} 
                            color="inherit"
                        /> 
                    )
                    : "Pre-order for €1"
                }
            </button>
        </section>
    )
}
