"use client";

import { useLocale } from "next-intl";
import s from "./style.module.scss";
import { ChangeEvent, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { language } from "@/types/auth";

export const LanguageOption = ()=> {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (e: ChangeEvent<HTMLSelectElement>)=> {
        const newLocale = e.target.value as language;

        if (locale === newLocale) return;

        startTransition(()=> {
            router.replace(
                pathname,
                { locale: newLocale }
            );
        })
    };

    const locales = [
        { label: "English", value: "en" },
        { label: "Francais", value: "fr" },
        { label: "Русский", value: "ru" },
        { label: "Italiano", value: "it" },
        { label: "Deutsch", value: "de" },
    ];

    return (
        <div
            className={s.lang_opt_sect}
        >
            <span className={s.lang_sign}>
                Language
            </span>

            <span
                className={s.lang_opt}
            >
                <select
                    className="appearance-none translate-x-1"
                    onChange={switchLocale}
                    value={locale}
                    disabled={isPending}
                >
                    {locales.map(({label, value})=>
                        <option
                            key={`prof-nav-el-locale-${value}`}
                            value={value}
                        >
                            {label}
                        </option>
                    )}
                </select>
                <Globe
                    className="w-4.5 h-4.5"
                />
            </span>
        </div>
    )
}