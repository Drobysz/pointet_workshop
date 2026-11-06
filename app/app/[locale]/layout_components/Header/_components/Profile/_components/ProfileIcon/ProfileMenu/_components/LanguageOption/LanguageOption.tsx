"use client";

import { hasLocale, useTranslations } from "next-intl";
import s from "./style.module.scss";
import { ChangeEvent } from "react";
import { Globe } from "lucide-react";
import { useSwitchLocale } from "@/hooks/useSwitchLocale";
import { localeNames, routing } from "@/i18n/routing";

export const LanguageOption = ()=> {
    const t = useTranslations("languageSwitcher");
    const { locale, isPending, switchLocale } = useSwitchLocale();

    const handleChange = (e: ChangeEvent<HTMLSelectElement>)=> {
        const newLocale = e.target.value;

        if (hasLocale(routing.locales, newLocale)) {
            switchLocale(newLocale);
        }
    };

    return (
        <div
            className={s.lang_opt_sect}
        >
            <span className={s.lang_sign}>
                {t("label")}
            </span>

            <span
                className={s.lang_opt}
            >
                <select
                    className="appearance-none translate-x-1"
                    aria-label={t("change")}
                    onChange={handleChange}
                    value={locale}
                    disabled={isPending}
                >
                    {routing.locales.map(value =>
                        <option
                            key={`prof-nav-el-locale-${value}`}
                            value={value}
                            lang={value}
                        >
                            {localeNames[value]}
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
