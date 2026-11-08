"use client";

import { MainBtn } from "@/components";
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
import { useTranslations } from "next-intl";

export const Profile = ()=> {
    const {
        user,
        userError,
        isUserLoading,
        basketList,
        preOrdersList,
        setPopUpWindow
    } = useContext(GlobalContext);
    const t = useTranslations("navigation");

    const handleSignUpClick = ()=> {
        setPopUpWindow("LoginForm");
    }

    const basketQuantity = (basketList ?? [])
        .reduce((acc, val) => acc + val.quantity, 0);

    const preOrderQuantity = preOrdersList?.length ?? 0;

    return (
        <div
            className={s.profile_section}
        >
            <div className={s.non_auth_navigation}>
                <LangaugeOption 
                    className={s.desktop_only}
                />
                <ProfileNavOption 
                    className={s.desktop_only}
                    href="/profile/preorders"
                    label={t("header.preordersLabel", { count: preOrderQuantity })}
                    quantity={preOrderQuantity}
                >
                    <Package />
                </ProfileNavOption>

                <ProfileNavOption 
                    href="/profile/basket"
                    label={t("header.basketLabel", { count: basketQuantity })}
                    key={`profile-basket-qntty-${basketQuantity}`}
                    quantity={basketQuantity}
                >
                        <Handbag />
                </ProfileNavOption>
            </div>
            <div className={s.account}>
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
                        {t("account.signIn")}
                    </MainBtn>
                }
            </div>
        </div>
    )
}
