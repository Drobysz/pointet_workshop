"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { usePathname } from "@/i18n/navigation";
import {
    DocCategory,
    Cursor
} from "./_components";
import { useState } from "react";
import { CursorCoordProps } from "./types";
import { tinyFive } from "@/fonts/fonts";
import { useTranslations } from "next-intl";

const DOC_LINKS = [
    { href: "/docs/legal_notice", labelKey: "legalNotice" },
    { href: "/docs/privacy_policy", labelKey: "privacyPolicy" },
    { href: "/docs/cookies_policy", labelKey: "cookiesPolicy" },
    { href: "/docs/refund_policy", labelKey: "refundPolicy" },
    { href: "/docs/seller_policy", labelKey: "sellerPolicy" },
    { href: "/docs/seller_rules", labelKey: "sellerRules" },
] as const;

export const SideMenu = ({
    className
}: {
    className: string;
})=> {
    const t = useTranslations("docs.navigation");
    const pathname = usePathname();
    const [hover, setHover] = useState(false);
    const defaultCoord = {left: 0, top: 0};
    const [cursorVertCoord, setCursorVertCoord] = useState<CursorCoordProps>(defaultCoord);
    const [cursorVertClickedCoord, setCursorVertClickedCoord] = useState<CursorCoordProps>(defaultCoord);

    // The pathname carries no locale prefix: "/docs" has no active document.
    const isHidden = pathname.split('/').length < 3;

    return (
        <aside
            className={cn(
                className,
                "flex flex-col gap-2 relative"
            )}
        >
            <div 
                className={s.sticky_nav}
                onMouseEnter={()=> setHover(true)}
                onMouseLeave={()=> setHover(false)}
            >
                <h2 className={cn(
                    s.title,
                    hover && s.title_gradient,
                    tinyFive.className
                )}>
                    {t("title")}
                </h2>
                <nav className={s.list_wrap}>
                    <ul className={s.list}>
                        {DOC_LINKS.map((p, i)=>
                            <DocCategory
                                key={`doc-${i}`}
                                href={p.href}
                                isActive={pathname.includes(p.href)}
                                cursorVertClickedCoord={cursorVertClickedCoord}
                                setCursorVertCoord={setCursorVertCoord}
                                setCursorVertClickedCoord={setCursorVertClickedCoord}
                            >
                                {t(p.labelKey)}
                            </DocCategory>
                        )}
                        <Cursor 
                            cursorCoord={cursorVertCoord}
                            isHidden={isHidden}
                        />
                    </ul>
                </nav>
            </div>
        </aside>
    )
}
