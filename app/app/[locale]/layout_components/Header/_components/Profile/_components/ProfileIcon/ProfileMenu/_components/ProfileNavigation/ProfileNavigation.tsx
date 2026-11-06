"use client";

import { Dispatch, SetStateAction, useContext } from "react";
import s from "./style.module.scss";
import { Link } from "@/i18n/navigation";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { ActiveQuantityTag } from "@/components";
import { useTranslations } from "next-intl";

export const ProfileNavigation = ({
    setIsOpen
}: {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
})=> {
    const {
        basketList,
        preOrdersList,
    } = useContext(GlobalContext);
    const t = useTranslations("navigation.account");

    const basketQuantity = (basketList ?? [])
        .reduce((acc, val) => acc + val.quantity, 0);

    const preOrderQuantity = preOrdersList?.length ?? 0;

    const profilePages = [
        { label: t("profile"), href: "/profile" },
        { label: t("preorders"), href: "/profile/preorders", qntty: preOrderQuantity },
        { label: t("basket"), href: "/profile/basket", qntty: basketQuantity },
    ];

    return (
        <nav className={s.divider}>
            <ul>
                {profilePages.map((item, id)=>
                    <Link
                        href={item.href}
                        key={`profile-nav-el${id}`}
                        onClick={()=> setIsOpen(false)}
                    >
                        <li
                            className={s.profile_nav_el}
                        >
                            <span>
                                {item.label}
                            </span>

                            {(item.qntty !== undefined && item.qntty > 0) &&
                                <ActiveQuantityTag 
                                    quantity={item.qntty}
                                />
                            }
                        </li>
                    </Link>
                )}
            </ul>
        </nav>
    )
}