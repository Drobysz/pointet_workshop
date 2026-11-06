"use client";

import { BasketItem } from "@/api/types/basket";
import { preorderApi } from "@/api/api";
import { useContext, useState } from "react";
import type { SubmitEventHandler } from "react";
import s from "./style.module.scss";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { LocalBasketService } from "@/helpers/basket";
import { useRouter } from "@/i18n/navigation";
import {
    CheckoutInfo,
    CheckoutBtn,
} from "./_components";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { createEmailFormScheme } from "./formScheme/EmailFormScheme";
import z from "zod";
import { useTranslations } from "next-intl";

export const CheckoutSection = ({
    basketList
}: {
    basketList: BasketItem[];
})=> {
    const t = useTranslations();
    const { setNotification, authStatus } = useContext(GlobalContext);

    const router = useRouter();

    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const createOrder: SubmitEventHandler<HTMLFormElement>  = async (e)=> {
        e.preventDefault();

        setError(null);
        setPending(true);

        try {
            const key = idempotencyKey ?? crypto.randomUUID();
            setIdempotencyKey(key);

            if (authStatus === "unauthenficated") {
                const parsed = createEmailFormScheme(t).safeParse({
                    email: email
                });

                if (!parsed.success) {
                    const errors = z.flattenError(parsed.error).fieldErrors;

                    setPending(false);
                    setError(errors.email?.[0] ?? "");
                    return;
                }
            }

            const res = await preorderApi.createPreorder({
                idempotency_key: key,
                ...(authStatus === "unauthenficated" 
                        ? { 
                            items: LocalBasketService.get(),
                            email: email
                        } 
                        : {}
                ),
            });
            
            if (!res.data.checkout_url) {
                setNotification({
                    status: "error",
                    text: t("checkout.notifications.checkoutCreationFailed")
                })

                setPending(false);
                setEmail("");
                return;
            }

            setPending(false);
            setEmail("");
            router.push(res.data.checkout_url);
        } catch (error) {
            getApiErrorMessage(error, t);
        }
    }

    const isGuest = authStatus === "unauthenficated";
    const isEmailEntered = 
        email.length < 3 && isGuest;
    const isBtnDisabled = pending ||
        isEmailEntered ||
        !basketList.length || 
        authStatus === "loading";

    return (
        <section className={s.checkout_sect}>
            <form 
                className="flex flex-col gap-3" 
                onSubmit={createOrder}
            >
                <div className={s.checkout_sect__contact}>
                    <CheckoutInfo 
                        setEmail={setEmail}
                        error={error}
                        isGuest={isGuest}
                    />
                </div>

                <CheckoutBtn 
                    disabled={isBtnDisabled}
                    isPending={pending}
                />
            </form>
        </section>
    )
}
