"use client";

import { CSSProperties, useContext, useId, useRef, useState } from "react";
import { ActiveQuantityTag, MainBtn, SlideSheet } from "@/components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { Link, usePathname } from "@/i18n/navigation";
import { cn, PathService } from "@/helpers";
import { useMediaQuery } from "@/hooks";
import { tinyFive } from "@/fonts/fonts";
import { headerPages } from "../../helpers";
import {
    LanguageOption,
    LogOutBtn,
    ProfileHeader,
} from "../Profile/_components/ProfileIcon/ProfileMenu/_components";
import s from "./style.module.scss";
import { useTranslations } from "next-intl";

// The burger menu replaces the header navigation below Tailwind `md`.
const MOBILE_QUERY = "(max-width: 767px)";

const getItemStyle = (index: number)=> (
    { "--item-index": index } as CSSProperties
);

export const MobileMenu = ()=> {
    const {
        user,
        userError,
        basketList,
        preOrdersList,
        setPopUpWindow,
    } = useContext(GlobalContext);
    const t = useTranslations("navigation");

    const menuId = useId();
    const pathname = usePathname();
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // The menu must not stay open (and lock scrolling) on wider screens.
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const isMenuOpen = isOpen && isMobile;

    const isAuth = Boolean(user && !userError);
    const basketQuantity = (basketList ?? [])
        .reduce((acc, val) => acc + val.quantity, 0);
    const preOrderQuantity = preOrdersList?.length ?? 0;

    const accountPages = [
        ...(isAuth ? [{ label: t("account.profile"), href: "/profile", quantity: 0 }] : []),
        { label: t("account.preorders"), href: "/profile/preorders", quantity: preOrderQuantity },
        { label: t("account.basket"), href: "/profile/basket", quantity: basketQuantity },
    ];

    const closeMenu = ()=> setIsOpen(false);

    const handleSignUpClick = ()=> {
        closeMenu();
        setPopUpWindow("LoginForm");
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={cn(s.burger, isMenuOpen && s.burger_open)}
                aria-label={isMenuOpen ? t("mobileMenu.close") : t("mobileMenu.open")}
                aria-expanded={isMenuOpen}
                aria-controls={menuId}
                onClick={()=> setIsOpen(p => !p)}
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

                <section
                    className={cn(s.account, s.item)}
                    style={getItemStyle(headerPages.length)}
                    aria-label={t("account.sectionLabel")}
                >
                    {user && isAuth &&
                        <ProfileHeader
                            email={user.email}
                            full_name={user.full_name}
                        />
                    }
                    <ul>
                        {accountPages.map((page)=>
                            <li key={`mobile-account-${page.href}`}>
                                <Link
                                    className={s.account_link}
                                    href={page.href}
                                    onClick={closeMenu}
                                >
                                    {page.label}
                                    {page.quantity > 0 &&
                                        <ActiveQuantityTag
                                            quantity={page.quantity}
                                        />
                                    }
                                </Link>
                            </li>
                        )}
                    </ul>
                    <div className={s.account_language}>
                        <LanguageOption />
                    </div>
                    {isAuth &&
                        <LogOutBtn
                            setIsOpen={setIsOpen}
                        />
                    }
                </section>

                {!isAuth &&
                    <div
                        className={s.item}
                        style={getItemStyle(headerPages.length + 1)}
                    >
                        <MainBtn
                            className="w-full"
                            onClick={handleSignUpClick}
                        >
                            {t("account.signUp")}
                        </MainBtn>
                    </div>
                }
            </SlideSheet>
        </>
    )
}
