"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { ReactNode, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CoverFeed } from "@/components";
import { tinyFive } from "@/fonts/fonts";
import { headerPages } from "../../helpers";
import { useTranslations } from "next-intl";

const NavElement = ({
    href,
    className,
    children, 
}: {
    href: string;
    className?: string;
    children: ReactNode;
})=> {
    const [hover, setHover] = useState(false);

    return (
        <li 
            className={cn(
                className,
                s.nav_element,
                tinyFive.className
            )}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <Link
                href={href}
            >
                <span className={cn(
                    s.sign,
                    hover && "translate-y-10",
                )}>
                    {children}
                </span>
                <CoverFeed
                    hover={hover}
                >
                    {children}
                </CoverFeed>
            </Link>
        </li>
    )
}


export const Navigation = ()=> {
    const t = useTranslations("navigation");

    return (
        <nav 
            className={s.nav_container}
            aria-label={t("header.mainLabel")}
        >
            <ul className={s.nav_list}>
                {headerPages.map((p, i)=>
                    <NavElement
                        key={`nav-item-${i}`}
                        href={p.href}
                    >
                        {t(`pages.${p.labelKey}`)}
                    </NavElement>
                )}
            </ul>
        </nav>
    )
}
