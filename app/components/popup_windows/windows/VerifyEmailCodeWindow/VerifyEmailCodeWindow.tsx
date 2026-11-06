"use client";

import { MainBtn } from "@/components/buttons/MainBtn/MainBtn";
import { ChangeEvent, useContext, useState } from "react";
import s from "./style.module.scss";
import { userApi } from "@/api/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { emailChangeVerificationErrorMessages } from "@/api/core/errorMessages";
import { ShadowBorderWindow } from "@/components/windows/ShadowBorderWindow/ShadowBorderWindow";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { useTranslations } from "next-intl";

export const VerifyEmailCodeWindow = ()=> {
    const t = useTranslations();
    const [value, setValue] = useState("");
    const { 
        user, 
        setNotification,
        setPopUpWindow,
        mutateUser,
    } = useContext(GlobalContext);
    
    const isButtonDisabled = value.length !== 6;
    const sendVerificationCode = async ()=> {
        if (!user) return;

        try {
            await userApi.verifyEmailCode(
                user.id, 
                { code: value }
            );

            setNotification({
                status: "success",
                text: t("auth.verifyEmail.success")
            });
            setPopUpWindow("none");
            mutateUser();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                t,
                emailChangeVerificationErrorMessages
            );

            setNotification({
                status: "error",
                text: message
            });
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>)=> {
        setValue(e.target.value);
    }

    return (
        <ShadowBorderWindow>
            <p
                className={cn(
                    s.title,
                    jersey10.className
                )}
            >
                {t("auth.verifyEmail.title")}
            </p>
            <form 
                className="flex flex-col gap-5"
                action={sendVerificationCode}
            >
                <input
                    className={s.input}
                    type="text"
                    aria-label={t("auth.verifyEmail.title")}
                    onChange={handleChange}
                />
                <MainBtn
                    disabled={isButtonDisabled}
                >
                    {t("common.actions.confirm")}
                </MainBtn>
            </form>
        </ShadowBorderWindow>
    )
}
