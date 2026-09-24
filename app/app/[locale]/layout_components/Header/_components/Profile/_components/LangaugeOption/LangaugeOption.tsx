"use client";

import { Globe } from "lucide-react"
import s from "./style.module.scss";
import { useLocale } from "next-intl";
import { language } from "@/types/auth";
import { MouseEvent, ReactNode, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AnimatePresence } from "framer-motion";
import { ViewReveal } from "@/components/animations/ViewReveal/ViewReveal";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import { CoverFeed } from "@/components";
import { useDismiss } from "@/hooks/useDismiss";

const HeaderLangOpt = ({
    value,
    children
}: {
    value: language;
    children: ReactNode;
})=> {
    const router = useRouter();
    const pathname = usePathname();
    const [_, startTransition] = useTransition();
    const [hover, setHover] = useState(false);

    const switchLocale = (e: MouseEvent<HTMLLIElement>)=> {
        const newLocale
            = e.currentTarget.getAttribute('value') as language;

        if (newLocale) {
            startTransition(()=> {
                router.replace(
                    pathname,
                    { locale: newLocale }
                );
            })
        }
    };

    return(
        <li
            key={`header-lang-opt-${value}`}
            className={s.lang_opt}
            onClick={switchLocale}
            value={value}
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

export const LangaugeOption = ()=> {
    const locale = useLocale();;
    const [isOpen, setIsOpen] = useState(false);

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    useDismiss({
        isOpen,
        refs: [btnRef, listRef],
        onDismiss: ()=> setIsOpen(false),
    });

    const locales = [
        { label: "English", value: "en" },
        { label: "Francais", value: "fr" },
        { label: "Русский", value: "ru" },
        { label: "Italiano", value: "it" },
        { label: "Deutsch", value: "de" },
    ].filter(lcl=> lcl.value !== locale);

    return (
        <div className="relative">
            <button
                className={cn(
                    s.lang_btn,
                    isOpen && "bg-gray-300"
                )}
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
                            {locales.map(({label, value})=>
                                <HeaderLangOpt
                                    key={`header-lang-opt-${value}`}
                                    value={value as language}
                                >
                                    {label}
                                </HeaderLangOpt>
                            )}
                        </ul>
                    </ViewReveal>
                }
            </AnimatePresence>
        </div>
    )
}
