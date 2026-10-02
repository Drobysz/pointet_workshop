"use client";

import { usePathname } from "next/navigation";
import s from "./style.module.scss";
import {
    Title,
} from "./_components";
import { Navbar } from "@/components/NavBar/NavBar";

export const ProfileHeader = ()=> {
    // Defining of page title
    const pathname = usePathname();
    const profileTitles: Record<string, string> = {
        "profile": "Profile",
        "orders": "Orders",
    }
    const names = pathname.split("/");
    const title = profileTitles[names[names.length - 1]];

    // List of profile pages
    const tabList = [
        { href: '/profile', label: "Profile" },
        { href: '/profile/orders', label: "Orders" },
        { href: '/basket', label: "Basket" }
    ];

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
