"use client";

import { ActiveQuantityTag, MainBtn } from "@/components";
import s from "./style.module.scss";
import {
    ProfileIcon,
    LangaugeOption,
    ProfileNavOption,
} from "./_components";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { Skeleton } from "@mui/material";
import { 
    Package,
    Handbag,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export const Profile = ()=> {
    const {
        user,
        userError,
        isUserLoading,
        authStatus,
        setPopUpWindow
    } = useContext(GlobalContext);

    const handleSignUpClick = ()=> {
        setPopUpWindow("LoginForm");
    }

    return (
        <div
            className={s.profile_section}
        >
            {authStatus === "unauthenficated" && (
                <div className={s.non_auth_navigation}>
                    <LangaugeOption />
                    <ProfileNavOption 
                        href="/profile/orders"
                        quantity={3}
                    >
                        <Package />
                    </ProfileNavOption>

                    <ProfileNavOption 
                        href="/profile/basket"
                        quantity={3}
                    >
                         <Handbag />
                    </ProfileNavOption>
                </div>
            )}
            {(user && !userError) &&
                <ProfileIcon />
            }
            {isUserLoading && 
                <Skeleton 
                    variant="circular"
                    height={40}
                    width={40}
                    animation="wave"
                />
            }
            {(!user || userError || isUserLoading) &&
                <MainBtn
                    onClick={handleSignUpClick}
                >
                    Sign Up
                </MainBtn>
            }
        </div>
    )
}
