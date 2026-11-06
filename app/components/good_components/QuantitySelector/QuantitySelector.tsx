"use client";

import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import s from "./style.module.scss";
import { after } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { SlidingNumber } from "@/components/animations/SlidingNumber/SlidingNumber";

export const QuantitySelector = ({
    maxQuantity,
    currentQuantity,
    setQuantity,
}: {
    maxQuantity: number;
    currentQuantity: number;
    setQuantity: Dispatch<SetStateAction<number>>;
})=> {
    const t = useTranslations("product.quantity");

    const removeUnity = ()=> {
        setQuantity(p => Math.max(p - 1, 0));
    };

    const addUnity = ()=> {
        setQuantity(p => Math.min(p + 1, maxQuantity));
    };

    return (
        <div className={s.qntty_selector}>
            <button
                className={s.qntty_selector__sel_btn}
                aria-label={t("decreaseLabel")}
                onClick={removeUnity}
            >
                -
            </button>
            <span className={after.className}>
                <SlidingNumber
                    value={currentQuantity}
                />
            </span>
            <button
                className={cn(
                    s.qntty_selector__sel_btn,
                    "pb-0.5"
                )}
                aria-label={t("increaseLabel")}
                onClick={addUnity}
            >
                +
            </button>
        </div>
    )
}
