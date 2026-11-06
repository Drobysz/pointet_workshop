"use client";

import { after, cutiveMono, tinyFive } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";
import { footerDocLinks } from "../../footerLinks";
import { UnderlinedInnerLink } from "@/components/animations/UnderlinedLink/UnderlinedInnerLink";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export const DocLinks = ()=> {
    const locale = useLocale();
    const t = useTranslations("navigation.footer");

    return (
        <div
            className={s.logo_tunnel}
        >
            <div
                className={s.logo_elevator}
            >
                <h2 
                    className={cn(
                        after.className,
                        s.logo_title,
                    )}
                >
                    Pointet
                </h2>

                <ul className={cn(
                    s.doc_list,
                    cutiveMono.className
                )}>
                    {footerDocLinks.map(({ labelKey, link }, idx)=>
                        <li
                            key={`footer-doc-${idx}`}
                            className="hover:underline"
                        >
                        <Link 
                            href={link}
                        >
                                {t(`legal.${labelKey}`)}
                            </Link>
                        </li>
                    )}
                    <li
                        className="flex gap-3 items-center"
                    >
                        {t.rich("developedBy", {
                            link: (chunks)=> (
                                <UnderlinedInnerLink
                                    href={`https://drobysz.agency/${locale}/services`}
                                    blank
                                    className={cn(
                                        tinyFive.className,
                                        s.developer_title
                                    )}
                                >
                                    {chunks}
                                </UnderlinedInnerLink>
                            ),
                        })}
                    </li>
                </ul>
            </div>
        </div>
    )
}
