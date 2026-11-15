"use client";

import { BasketItem } from "@/api/types/basket";
import { ordersApi } from "@/api/api";
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
import { 
    BasketFormError, 
    BasketRequestData, 
    createBasketFormScheme 
} from "./formScheme/BasketFormScheme";
import z from "zod";
import { useTranslations } from "next-intl";

const emptyBasketForm = {
    email: "",
    full_name: "",
    address: "",
}

export const CheckoutSection = ({
    basketList
}: {
    basketList: BasketItem[];
})=> {
    const t = useTranslations();
    const { setNotification, authStatus } = useContext(GlobalContext);

    const router = useRouter();

    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
    const [basketRequestData, setBasketRequestData] = useState<BasketRequestData>(emptyBasketForm);
    const [errors, setErrors] = useState<BasketFormError | null>(null);
    const [pending, setPending] = useState(false);

    const createOrder: SubmitEventHandler<HTMLFormElement>  = async (e)=> {
        e.preventDefault();

        setErrors(null);
        setPending(true);

        try {
            const key = idempotencyKey ?? crypto.randomUUID();
            setIdempotencyKey(key);
            const {email, full_name, address} = basketRequestData;

            if (authStatus === "unauthenficated") {

                const parsed = createBasketFormScheme(t).safeParse({
                    email: email,
                    full_name: full_name,
                    address: address,
                });

                if (!parsed.success) {
                    const formatErrors = z.flattenError(parsed.error).fieldErrors;

                    setPending(false);
                    setErrors(formatErrors);
                    return;
                }
            }

            const res = await ordersApi.createOrder({
                idempotency_key: key,
                ...(authStatus === "unauthenficated" 
                        ? { 
                            items: LocalBasketService.get(),
                            email: email,
                            full_name: full_name,
                            address: address,
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
                setBasketRequestData(emptyBasketForm);
                return;
            }

            setPending(false);
            setBasketRequestData(emptyBasketForm);
            router.push(res.data.checkout_url);
        } catch (error) {
            getApiErrorMessage(error, t);
        }
    }

    const isGuest = authStatus === "unauthenficated";
    const isBasketFormFilled = 
        isGuest && !Object
            .values(basketRequestData)
            .every(value => value.trim() !== "");
    const isBtnDisabled = pending ||
        isBasketFormFilled ||
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
                        errors={errors}
                        basketRequestData={basketRequestData}
                        setBasketRequestData={setBasketRequestData}
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
