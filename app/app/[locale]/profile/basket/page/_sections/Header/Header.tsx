"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { jersey10 } from "@/fonts/fonts";
import { useTranslations } from "next-intl";

export const Header = ({
    basketLength
}: {
    basketLength: number;
})=> {
    const t = useTranslations("basket.header");

    return (
        <header className={s.basket_header}>
            <div className={s.title_container}>
                <span className={cn(
                    s.title_container__title,
                    jersey10.className
                )}>
                    {t("title")}
                </span>

                <span className={cn(
                    s.title_container__subtitle
                )}>
                    {t("count", { count: basketLength })}
                </span>
            </div>
        </header>
    )
}
