"use client";

import { stripeApi } from "@/api/api";
import { PreorderPaymentStatus } from "@/api/types/preorder";
import { Skeleton } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import useSWR from "swr";
import { GlobalContext } from "../context/global.context";
import { LocalBasketService } from "@/helpers/basket";

const statusMessages: Record<PreorderPaymentStatus, { title: string; body: string }> = {
    pending: {
        title: "Payment received — confirming it now",
        body: "Stripe is processing the confirmation. Keep this page open; it will update automatically.",
    },
    paid: {
        title: "Your €1 pre-order is confirmed",
        body: "Thank you. We will contact you when this product becomes available.",
    },
    failed: {
        title: "Payment was not completed",
        body: "No pre-order was confirmed. You can return to your basket and try again.",
    },
    canceled: {
        title: "Checkout was cancelled",
        body: "No pre-order was confirmed. You can return to your basket and try again.",
    },
    refunded: {
        title: "This pre-order was refunded",
        body: "The payment is no longer active.",
    },
};

export function SuccessView() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const { data, error, isLoading, mutate } = useSWR(
        sessionId ? ["stripe-checkout-session", sessionId] : null,
        ([, id]) => stripeApi.getCheckoutSession(id),
    );
    const paymentStatus = data?.data.payment_status;
    const { mutateBasket } = useContext(GlobalContext);

    useEffect(() => {
        if (paymentStatus !== "pending") {
            return;
        }
        const interval = window.setInterval(() => {
            void mutate();
        }, 2000);

        return () => window.clearInterval(interval);
    }, [mutate, paymentStatus]);

    useEffect(() => {
        if (paymentStatus === "paid") {
            LocalBasketService.clear();
            void mutateBasket();
        }
    }, [mutateBasket, paymentStatus]);

    if (error || !paymentStatus) {
        return (
            <main className="px-5 py-16">
                <h1>We could not verify this payment</h1>
                <p>Please sign in with the account used for checkout and try again.</p>
            </main>
        )
    }

    const message = statusMessages[paymentStatus];

    return (
        <main className="px-5 py-16 flex justify-center items-center flex-col gap-3 text-orange-400">
            {!sessionId && (
                <>
                    <h1 className="text-2xl font-bold">
                        Payment session is missing
                    </h1>
                    <p>
                        Return to your basket and start the pre-order again.
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
                    <h1>{message.title}</h1>
                    <p>{message.body}</p>
                </>
            )}
        </main>
    );
}
