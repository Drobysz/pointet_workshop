"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { CoverFeed } from "@/components";
import { tinyFive } from "@/fonts/fonts";

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


export const Navigation = ({
})=> {
    const pages = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "Contacts", href: "/contacts" },
    ];

    return (
        <nav className={s.nav_container}>
            <ul className={s.nav_list}>
                {pages.map((p, i)=>
                    <NavElement
                        key={`nav-item-${i}`}
                        href={p.href}
                    >
                        {p.label}
                    </NavElement>
                )}
            </ul>
        </nav>
    )
}
