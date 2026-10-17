"use client";

import { useLocale } from "next-intl";
import s from "./style.module.scss";
import { ChangeEvent, useContext, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { language } from "@/types/auth";
import { CookiesService } from "@/helpers";
import { userApi } from "@/api/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";

export const LanguageOption = ()=> {
    const { user, mutateUser } = useContext(GlobalContext);
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const switchLocale = async (e: ChangeEvent<HTMLSelectElement>)=> {
        const newLocale = e.target.value as language;

        if (locale === newLocale) return;

        startTransition(async ()=> {
            const cookies = new CookiesService();
            
            if (user) {
                await userApi.updateUser(
                    user.id,
                    { language: newLocale }
                )
                mutateUser();
            }
        
            cookies.setCookies(
                "NEXT_LOCALE",
                newLocale,
                60 * 60 * 24 * 365,
            );

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