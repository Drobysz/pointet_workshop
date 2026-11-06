"use client";

import { CircularProgress } from "@mui/material";
import s from "../../style.module.scss"
import { useTranslations } from "next-intl";

export const CheckoutBtn = ({
    disabled,
    isPending,
}: {
    disabled: boolean;
    isPending: boolean;
})=> {
    const t = useTranslations("checkout.button");

    return (
        <button
            className={s.checkout_sect__preorderButton}
            type="submit"
            disabled={disabled}
            aria-busy={isPending}
        >
            {isPending && (
                <>
                    <CircularProgress
                        aria-hidden="true" 
                        size={20}
                        sx={{ color: "white" }}
                    />
                </>
            )}

            {!isPending && (disabled 
                ? t("emailRequired")
                : t("preorder")
            )}
        </button>
    )
}