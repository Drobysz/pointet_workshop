"use client";

import { Id } from "@/api/types/api";
import s from "./style.module.scss";
import { ChangeEvent, useContext, useState } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { userFieldSchemas } from "@/auth/FormSchemes";
import { DecoInput } from "@/components";
import { userApi } from "@/api/api";
import { emailChangeErrorMessages } from "@/api/core/errorMessages";
import { InputBtn } from "../InputBtn/InputBtn";

export const EmailForm = ({
    userId,
    initialValue,
    placeholder,
}: {
    userId: Id;
    initialValue: string;
    placeholder?: string;
})=> {
    const { 
        setNotification,
        setPopUpWindow
    } = useContext(GlobalContext);
    const [value, setValue] = useState(initialValue);
    const [isPending, setIsPending] = useState(false);

    const isButtonDisabled = value.trim() === initialValue;
    const schema = userFieldSchemas.email;

    const updateUserParam = async ()=> {
        setIsPending(true);

        try {
            const result = schema.safeParse(value);

            if (!result.success) {
                setNotification({
                    status: "error",
                    text: result.error.issues[0].message
                });
                return ;
            }

            await userApi.updateEmail(userId, {
                email: value
            });

            setNotification({
                status: "success",
                text: "A verification code was sent to your new email"
            });

            setPopUpWindow("VerifyCodeWindow");
        } catch (error) {

            setNotification({
                status: "error",
                text: getApiErrorMessage(
                    error,
                    emailChangeErrorMessages
                )
            });
        } finally {
            setIsPending(false);
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>)=> {
        setValue(e.target.value);
    }

    return (
        <form 
            className={s.form_container}
            action={updateUserParam}
        >
            <label
                className={cn(
                    s.label,
                    jersey10.className
                )}
            >
                Email
            </label>

            <div className="flex items-center gap-2">
                <DecoInput
                    className={s.input}
                    value={value}
                    type="email"
                    placeholder={placeholder ?? ""}
                    onChange={handleChange}
                />


                <InputBtn
                    buttonDisabled={isButtonDisabled}
                    pending={isPending}
                />
            </div>
        </form>
    )
}
