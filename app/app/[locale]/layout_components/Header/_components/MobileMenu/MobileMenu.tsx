"use client";

import { useId, useRef, useState } from "react";
import { SlideSheet } from "@/components";
import { Link, usePathname } from "@/i18n/navigation";
import { cn, PathService } from "@/helpers";
import { useMediaQuery } from "@/hooks";
import { tinyFive } from "@/fonts/fonts";
import { headerPages } from "../../helpers";
import { AccountSection } from "./_components";
import { getItemStyle } from "./helpers";
import s from "./style.module.scss";
import { useTranslations } from "next-intl";

// The burger menu replaces the header navigation below Tailwind `md`.
const MOBILE_QUERY = "(max-width: 767px)";

export const MobileMenu = ()=> {
    const t = useTranslations("navigation");

    const menuId = useId();
    const pathname = usePathname();
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    // The pathname the menu was opened on. Any route change (a link in
    // the menu, history navigation) closes the menu without an effect.
    const [openedAt, setOpenedAt] = useState<string | null>(null);

    if (openedAt !== null && openedAt !== pathname) {
        setOpenedAt(null);
    }

    // The menu must not stay open (and lock scrolling) on wider screens.
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const isMenuOpen = openedAt === pathname && isMobile;

    const closeMenu = ()=> setOpenedAt(null);
    const toggleMenu = ()=> setOpenedAt(isMenuOpen ? null : pathname);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={cn(s.burger, isMenuOpen && s.burger_open)}
                aria-label={isMenuOpen ? t("mobileMenu.close") : t("mobileMenu.open")}
                aria-expanded={isMenuOpen}
                aria-controls={menuId}
                onClick={toggleMenu}
            >
                <span className={s.burger__line} />
                <span className={s.burger__line} />
            </button>

            <SlideSheet
                id={menuId}
                side="top"
                label={t("mobileMenu.label")}
                className={s.menu}
                isOpen={isMenuOpen}
                onClose={closeMenu}
                triggerRef={triggerRef}
            >
                <nav aria-label={t("header.mainLabel")}>
                    <ul className={cn(s.nav_list, tinyFive.className)}>
                        {headerPages.map((page, index)=> {
                            const isActive = PathService.getPageActivity(
                                pathname, page.href
                            );

                            return (
                                <li
                                    key={`mobile-nav-${page.href}`}
                                    className={s.item}
                                    style={getItemStyle(index)}
                                >
                                    <Link
                                        className={cn(
                                            s.nav_link,
                                            isActive && s.nav_link_active
                                        )}
                                        href={page.href}
                                        aria-current={isActive ? "page" : undefined}
                                        onClick={closeMenu}
                                    >
                                        {t(`pages.${page.labelKey}`)}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <AccountSection
                    itemIndex={headerPages.length}
                    onClose={closeMenu}
                />
            </SlideSheet>
        </>
    )
}
