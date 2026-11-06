"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import s from "./style.module.scss";
import {
    Title,
} from "./_components";
import { Navbar } from "@/components";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";

const profileSections = ["profile", "preorders", "basket"] as const;

export const ProfileHeader = ()=> {
    const t = useTranslations("profile.navigation");
    const { user, userError } = useContext(GlobalContext);

    // Defining of page title: the last path segment names the section.
    // The locale-aware pathname has no locale prefix, the last segment
    // is the same as in the full path.
    const pathname = usePathname();
    const names = pathname.split("/");
    const lastName = names[names.length - 1];
    const section = profileSections.find(name => name === lastName);
    const title = section ? t(section) : "";

    // Defining page list
    const authTabList = [
        { href: '/profile', label: t("profile") },
    ];

    const defaultTablist = [
        { href: '/profile/preorders', label: t("preorders") },
        { href: '/profile/basket', label: t("basket") }
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
                className="pb-1"
                key={isAuth ? "auth" : "unauth"}
                paths={tabList}
            />
        </header>
    )
}
