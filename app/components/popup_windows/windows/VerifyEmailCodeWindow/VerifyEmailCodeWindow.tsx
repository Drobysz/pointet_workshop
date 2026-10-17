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

export const VerifyEmailCodeWindow = ()=> {
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
                text: "Email was updated"
            });
            setPopUpWindow("none");
            mutateUser();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
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
                Enter verification code
            </p>
            <form 
                className="flex flex-col gap-5"
                action={sendVerificationCode}
            >
                <input
                    className={s.input}
                    type="text"
                    onChange={handleChange}
                />
                <MainBtn
                    disabled={isButtonDisabled}
                >
                    Confirm
                </MainBtn>
            </form>
        </ShadowBorderWindow>
    )
}
