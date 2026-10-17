"use client";

import { Dispatch, SetStateAction, useContext } from "react";
import s from "./style.module.scss";
import { Link } from "@/i18n/navigation";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { ActiveQuantityTag } from "@/components";

export const ProfileNavigation = ({
    setIsOpen
}: {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
})=> {
    const { user } = useContext(GlobalContext);

    const profilePages = [
        { label: "My profile", href: "/profile" },
        { label: "My orders", href: "/profile/orders", qntty: user?.orders_count ?? 0 },
        { label: "My Basket", href: "/profile/basket", qntty: user?.basket_goods_count ?? 0 },
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