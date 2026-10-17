"use client";

import { Id } from "@/api/types/api";
import s from "./style.module.scss";
import { ChangeEvent, useContext, useState } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { User, UserResponse } from "@/api/types/user";
import { UserField, userFieldSchemas } from "@/auth/FormSchemes";
import { MainBtn } from "@/components";
import { CircularProgress } from "@mui/material";

export const InputForm = ({
    userId,
    label,
    initialValue,
    param,
    inputType="text",
    placeholder,
    request
}: {
    userId: Id;
    label: string;
    initialValue: string;
    param: UserField;
    inputType?: "email" | "text";
    placeholder?: string;
    request: (
        id: Id, 
        params: Partial<User>
    )=> Promise<UserResponse>;
})=> {
    const { setNotification, mutateUser } = useContext(GlobalContext);
    const [value, setValue] = useState(initialValue);
    const [isPending, setIsPending] = useState(false);

    const isButtonDisabled = value.trim() === initialValue;
    const schema = userFieldSchemas[param];

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

            await request(userId, {
                [param]: value
            });

            mutateUser();
            setNotification({
                status: "success",
                text: `${label} was updated`
            });
        } catch (error) {

            setNotification({
                status: "error",
                text: getApiErrorMessage(error)
            });
        } finally {
            setIsPending(false);
        };
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
                {label}
            </label>

            <div className="flex items-center gap-2">
                <input
                    className={s.input}
                    value={value}
                    type={inputType}
                    placeholder={placeholder ?? ""}
                    onChange={handleChange}
                />

                <MainBtn
                    disabled={isButtonDisabled}
                    className={cn(
                        tinyFive.className,
                        s.change_btn,
                        isButtonDisabled
                            && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isPending 
                        ? <CircularProgress 
                            size={10}
                            color="inherit"
                            className="z-30"
                        />
                        : "Change"
                    }
                </MainBtn>
            </div>
        </form>
    )
}
