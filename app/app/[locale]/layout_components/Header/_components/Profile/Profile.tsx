"use client";

import { MainBtn } from "@/components";
import s from "./style.module.scss";
import {
    ProfileIcon,
    LangaugeOption,
} from "./_components";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { Skeleton } from "@mui/material";

export const Profile = ()=> {
    const {
        user,
        userError,
        isUserLoading,
        setPopUpWindow
    } = useContext(GlobalContext);

    const handleSignUpClick = ()=> {
        setPopUpWindow("LoginForm");
    }

    return (
        <div
            className={s.profile_section}
        >
            <LangaugeOption />
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
