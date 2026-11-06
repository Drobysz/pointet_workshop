"use client";

import s from "./style.module.scss";
import { cn } from "@/helpers";
import { ShadowBorderWindowProps } from "./ShadowBorderWindow.props";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import Cross from "@/assets/close.svg";
import { useTranslations } from "next-intl";

export const ShadowBorderWindow = ({
    className,
    children,
    withoutCross = false,
    withoutGradient = false,
}: ShadowBorderWindowProps)=> {
    const t = useTranslations("common.actions");
    const { setPopUpWindow } = useContext(GlobalContext);

    return (
        <article
            className={cn(
                s.auth_window,
                !withoutGradient && s.with_gradient,
                className,
            )}
        >
            {!withoutCross &&
                <div className="flex justify-end">
                    <button 
                        className={s.cross_frame}
                        aria-label={t("close")}
                        onClick={()=> setPopUpWindow("none")}
                    >
                        <Cross 
                            className="text-red-900"
                        />
                    </button>
                </div>
            }
            {children}
        </article>
    )
}
