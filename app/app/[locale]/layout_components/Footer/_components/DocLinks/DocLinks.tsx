"use client";

import { after, cutiveMono, tinyFive } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";
import footer_links from "@/json/footer_links.json";
import { UnderlinedInnerLink } from "@/components/animations/UnderlinedLink/UnderlinedInnerLink";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export const DocLinks = ()=> {
    const locale = useLocale();
    console.log(locale)
    const docLinks = footer_links.doc_links;

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
                    {docLinks.map(({ label, link }, idx)=>
                        <li
                            key={`footer-doc-${idx}`}
                            className="hover:underline"
                        >
                        <Link 
                            href={link}
                        >
                                {label}
                            </Link>
                        </li>
                    )}
                    <li
                        className="flex gap-3 items-center"
                    >
                        Developed by 
                        <UnderlinedInnerLink
                            href={`https://drobysz.agency/${locale}/services`}
                            blank
                            className={cn(
                                tinyFive.className,
                                s.developer_title
                            )}
                        >
                            Drobysz
                        </UnderlinedInnerLink>
                    </li>
                </ul>
            </div>
        </div>
    )
}
