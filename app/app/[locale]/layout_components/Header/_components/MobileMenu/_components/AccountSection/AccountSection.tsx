"use client";

import { Dispatch, SetStateAction, useContext } from "react";
import { useTranslations } from "next-intl";
import { ActiveQuantityTag, MainBtn } from "@/components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { Link } from "@/i18n/navigation";
import { cn } from "@/helpers";
import {
    LanguageOption,
    LogOutBtn,
    ProfileHeader,
} from "../../../Profile/_components/ProfileIcon/ProfileMenu/_components";
import { getItemStyle } from "../../helpers";
import s from "../../style.module.scss";

interface AccountSectionProps {
    /** Stagger index of the section, after the page links. */
    itemIndex: number;
    /** Closes the menu, e.g. after a link or the sign-in button is used. */
    onClose: ()=> void;
}

/**
 * Session-dependent part of the mobile menu. It is the only part that
 * reads the global context, and it is mounted only while the menu is
 * open, so context updates do not re-render the closed menu.
 */
export const AccountSection = ({
    itemIndex,
    onClose,
}: AccountSectionProps)=> {
    const {
        user,
        userError,
        basketList,
        preOrdersList,
        setPopUpWindow,
    } = useContext(GlobalContext);
    const t = useTranslations("navigation");

    const isAuth = Boolean(user && !userError);
    const basketQuantity = (basketList ?? [])
        .reduce((acc, val) => acc + val.quantity, 0);
    const preOrderQuantity = preOrdersList?.length ?? 0;

    const accountPages = [
        ...(isAuth ? [{ label: t("account.profile"), href: "/profile", quantity: 0 }] : []),
        { label: t("account.preorders"), href: "/profile/preorders", quantity: preOrderQuantity },
        { label: t("account.basket"), href: "/profile/basket", quantity: basketQuantity },
    ];

    // `LogOutBtn` reports the end of the logout through a boolean setter.
    const handleLogOutState: Dispatch<SetStateAction<boolean>> = (value)=> {
        const isOpen = typeof value === "function" ? value(true) : value;

        if (!isOpen) {
            onClose();
        }
    };

    const handleSignInClick = ()=> {
        onClose();
        setPopUpWindow("LoginForm");
    };

    return (
        <>
            <section
                className={cn(s.account, s.item)}
                style={getItemStyle(itemIndex)}
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
                                onClick={onClose}
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
                        setIsOpen={handleLogOutState}
                    />
                }
            </section>

            {!isAuth &&
                <div
                    className={s.item}
                    style={getItemStyle(itemIndex + 1)}
                >
                    <MainBtn
                        className="w-full"
                        onClick={handleSignInClick}
                    >
                        {t("account.signIn")}
                    </MainBtn>
                </div>
            }
        </>
    )
}
