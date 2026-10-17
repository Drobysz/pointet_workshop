"use client";

import { Id } from "@/api/types/api"
import { FormSectionTitle } from "../../_components"
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import s from "./style.module.scss";
import { useActionState, useContext, useEffect } from "react";
import { UpdatePasswordFormState } from "@/auth/FormSchemes";
import { CircularProgress } from "@mui/material";
import { MainBtn } from "@/components";
import { updatePassword } from "@/auth/actions/updatePasswordAction";
import { GlobalContext } from "@/app/[locale]/context/global.context";

export const SecuritySection = ({
    userId
}: {
    userId: Id;
})=> {
    const { setNotification } = useContext(GlobalContext);

    const updatePasswordWithUserId = updatePassword.bind(
        null,
        userId,
    );

    const [state, action, pending] = 
        useActionState<UpdatePasswordFormState, FormData>(
            updatePasswordWithUserId, 
            { errors: {} }
        );
    
    useEffect(()=> {
        if (!state.message) return;

        setNotification({
            status: state.success 
                ? "success" 
                : "error",
            text: state.message
        });

    }, [state, setNotification])

    return (
        <div className="flex flex-col gap-4 max-w-200 w-full">
            <FormSectionTitle>
                Security
            </FormSectionTitle>

            <form 
                className="flex items-end gap-6"
                action={action}
            >
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className={cn(
                            jersey10.className,
                            "text-xl pl-1.5 flex gap-3 text-zinc-500"
                        )}>
                            <span>
                                Current password
                            </span>
                            {state.errors?.current_password &&
                                <span className="text-red-500">
                                    {state.errors?.current_password}
                                </span>
                            }
                        </label>

                        <input 
                            className={cn(
                                s.input
                            )}
                            name="current_password"
                            type="text"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={cn(
                            jersey10.className,
                            "text-xl pl-1.5 flex gap-3 text-zinc-500"
                        )}>
                            <span>
                                New password
                            </span>
                            {state.errors?.new_password &&
                                <span className="text-red-500">
                                    {state.errors?.new_password}
                                </span>
                            }
                        </label>

                        <input 
                            className={cn(
                                s.input
                            )}
                            name="new_password"
                            type="text"
                        />
                    </div>
                </div>

                <MainBtn
                    className="min-w-30"
                >
                    {pending 
                        ? <CircularProgress 
                            size={10} 
                            color="inherit" 
                        />
                        : "Update password"}
                </MainBtn>
            </form>
        </div>
    )
}
