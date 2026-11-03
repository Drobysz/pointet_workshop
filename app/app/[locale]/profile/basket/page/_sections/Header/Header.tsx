"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { jersey10 } from "@/fonts/fonts";

export const Header = ({
    basketLength
}: {
    basketLength: number;
})=> {

    return (
        <header className={s.basket_header}>
            <div className={s.title_container}>
                <span className={cn(
                    s.title_container__title,
                    jersey10.className
                )}>
                    Goods
                </span>

                <span className={cn(
                    s.title_container__subtitle
                )}>
                    {`${basketLength} good${basketLength > 1 ? "s" : ""}`}
                </span>
            </div>
        </header>
    )
}
