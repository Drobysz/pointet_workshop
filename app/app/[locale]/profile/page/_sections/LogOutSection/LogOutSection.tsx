"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { useLogout } from "@/hooks";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";

export const LogOutSection = ()=> {
    const t = useTranslations("profile.accountActions");
    const tActions = useTranslations("common.actions");
    const {
        logOut,
        isPending: isLogOutPending,
    } = useLogout();

    const { setPopUpWindow } = useContext(GlobalContext);

    const handleLogoutBtnClick = 
        async ()=> await logOut();

    const handleClickDeleteBtn = 
        ()=> setPopUpWindow("DeleteWindow");

    return (
        <div
            className={s.alert_actions_container}
        >
            <div
                className={s.alert_actions_subcontainer}
            >
                <span className={cn(
                    s.alert_actions_title,
                    jersey10.className
                )}>
                    {t("logOutTitle")}
                </span>


                <button
                    className={cn(
                        s.alert_actions_btn,
                        s.logout_btn,
                        jersey10.className
                    )}
                    onClick={handleLogoutBtnClick}
                >
                    {isLogOutPending 
                        ? <CircularProgress 
                            color="inherit"
                            size={10}
                        />
                        : t("logOut")
                    }
                </button>
            </div>

            <div
                className={s.alert_actions_subcontainer}
            >
                <span className={cn(
                    s.alert_actions_title,
                    jersey10.className
                )}>
                    {t("deleteTitle")}
                </span>


                <button
                    className={cn(
                        s.alert_actions_btn,
                        s.delete_btn,
                        tinyFive.className
                    )}
                    onClick={handleClickDeleteBtn}
                >
                    {tActions("delete")}
                </button>
            </div>
        </div>
    )
}
