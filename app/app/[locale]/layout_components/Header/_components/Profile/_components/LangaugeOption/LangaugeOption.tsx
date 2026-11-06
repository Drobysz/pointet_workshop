"use client";

import { Globe } from "lucide-react"
import s from "./style.module.scss";
import { useTranslations } from "next-intl";
import { ReactNode, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ViewReveal } from "@/components/animations/ViewReveal/ViewReveal";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import { CoverFeed } from "@/components";
import { useDismiss } from "@/hooks/useDismiss";
import { useSwitchLocale } from "@/hooks/useSwitchLocale";
import { AppLocale, localeNames, routing } from "@/i18n/routing";

const HeaderLangOpt = ({
    value,
    onSelect,
    children
}: {
    value: AppLocale;
    onSelect: (locale: AppLocale) => void;
    children: ReactNode;
})=> {
    const [hover, setHover] = useState(false);

    return(
        <li
            className={s.lang_opt}
            lang={value}
            onClick={()=> onSelect(value)}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            {children}
            <CoverFeed
                hover={hover}
            >
                {children}
            </CoverFeed>
        </li>
    )
}

export const LangaugeOption = ({
    className
}: {
    className?: string;
})=> {
    const t = useTranslations("languageSwitcher");
    const { locale, switchLocale } = useSwitchLocale();
    const [isOpen, setIsOpen] = useState(false);

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    useDismiss({
        isOpen,
        refs: [btnRef, listRef],
        onDismiss: ()=> setIsOpen(false),
    });

    const locales = routing.locales.filter(lcl => lcl !== locale);

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                className={cn(
                    s.lang_btn,
                    isOpen && "bg-gray-300"
                )}
                aria-label={t("change")}
                aria-expanded={isOpen}
                ref={btnRef}
                onClick={()=> setIsOpen(p => !p)}
            >
                <Globe
                    className="w-5 h-5"
                />

            </button>
            <AnimatePresence>
                {isOpen &&
                    <ViewReveal
                        className={s.lang_list}
                        animationType="up_down_disclosure"
                        once={false}
                    >
                        <ul
                            className={tinyFive.className}
                            ref={listRef}
                        >
                            {locales.map(value =>
                                <HeaderLangOpt
                                    key={`header-lang-opt-${value}`}
                                    value={value}
                                    onSelect={switchLocale}
                                >
                                    {localeNames[value]}
                                </HeaderLangOpt>
                            )}
                        </ul>
                    </ViewReveal>
                }
            </AnimatePresence>
        </div>
    )
}
