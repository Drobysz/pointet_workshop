"use client";

import { Dispatch, SetStateAction } from "react";
import s from "./style.module.scss";
import { Link } from "@/i18n/navigation";

export const ProfileNavigation = ({
    setIsOpen
}: {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
})=> {
    const profilePages = [
        { label: "My profile", href: "/profile" },
        { label: "My orders", href: "/profile/orders" },
        { label: "Purchases history", href: "/profile/history" },
    ];

    return (
        <nav className={s.divider}>
            <ul>
                {profilePages.map(({label, href}, id)=>
                    <Link
                        href={href}
                        key={`profile-nav-el${id}`}
                        onClick={()=> setIsOpen(false)}
                    >
                        <li
                            className={s.profile_nav_el}
                        >
                            {label}
                        </li>
                    </Link>
                )}
            </ul>
        </nav>
    )
}