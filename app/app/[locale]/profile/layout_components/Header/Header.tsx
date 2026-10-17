"use client";

import { usePathname } from "next/navigation";
import s from "./style.module.scss";
import {
    Title,
} from "./_components";
import { Navbar } from "@/components/other/NavBar/NavBar";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";

export const ProfileHeader = ()=> {
    const { user, userError } = useContext(GlobalContext);

    // Defining of page title
    const pathname = usePathname();
    const profileTitles: Record<string, string> = {
        "profile": "Profile",
        "orders": "Orders",
        "basket": "Basket",
    }
    const names = pathname.split("/");
    const title = profileTitles[names[names.length - 1]];

    // Defining page list
    const authTabList = [
        { href: '/profile', label: "Profile" },
        { href: '/profile/orders', label: "Orders" },
    ];

    const defaultTablist = [
        { href: '/profile/basket', label: "Basket" }
    ];

    const isAuth = user && !userError;

    // List of profile pages
    const tabList = isAuth 
        ? [...authTabList, ...defaultTablist]
        : defaultTablist;

    return (
        <header
            className={s.profile_header}
        >
            <Title 
                title={title}
            />

            <Navbar 
                paths={tabList}
            />
        </header>
    )
}
