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
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import { Skeleton } from "@mui/material";

const ProfileMenu = ({
    full_name,
    email,
    setIsOpen,
    ...props
}: ProfileMenuProps)=> {
    const {
        user,
        isUserLoading,
    } = useContext(GlobalContext);

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
                {user &&
                    <ProfileHeader
                        email={user.email}
                        full_name={user.full_name}
                    /> 
                }
                <ProfileNavigation
                    setIsOpen={setIsOpen}
                />
                <LanguageOption />
                <LogOutBtn 
                    setIsOpen={setIsOpen}
                />
            </article>
            {isUserLoading && 
                <Skeleton
                    variant="circular"
                    height={300}
                    width={100}
                    animation="wave"
                />
            }
        </ViewReveal>
    )
}

export default ProfileMenu;
