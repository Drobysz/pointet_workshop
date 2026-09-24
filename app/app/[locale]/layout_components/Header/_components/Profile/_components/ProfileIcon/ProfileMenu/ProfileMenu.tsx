"use client";

import { cn } from "@/helpers";
import { ProfileMenuProps } from "./ProfileMenu.props";
import s from "./style.module.scss";
import { inter_regular } from "@/fonts/fonts";
import {
    ProfileHeader,
    ProfileNavigation,
    LanguageOption,
    LogOutBtn,
} from "./_components";
import { ViewReveal } from "@/components/animations/ViewReveal/ViewReveal";

const ProfileMenu = ({
    full_name,
    email,
    setIsOpen,
    ...props
}: ProfileMenuProps)=> {
    return (
        <ViewReveal
            animationType="up_down_disclosure"
            once={false}
            className={cn(
                s.menu_window,
                inter_regular.className
            )}
        >
            <article
                {...props}
            >
                <ProfileHeader
                    email={email}
                    full_name={full_name}
                />
                <ProfileNavigation
                    setIsOpen={setIsOpen}
                />
                <LanguageOption />
                <LogOutBtn />
            </article>
        </ViewReveal>
    )
}

export default ProfileMenu;
