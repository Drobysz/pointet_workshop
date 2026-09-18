"use client";

import AscendingImagesBackground from "@/components/backgrounds/AscendingImagesBackground/AscendingImagesBackground"
import { useActionState, useContext, useEffect } from "react";
import { FormError, FormState } from "./form/FormScheme";
import { InputLite, LinkBtn } from "@/components";
import { CircularProgress } from "@mui/material";
import s from "./style.module.scss";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { contactAction } from "./form/contactAction";
import forms from "@/json/contact_form.json";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";

export const PageView = ()=> {
    const { setNotification } = useContext(GlobalContext);

    const [state, action, pending] = 
        useActionState<FormState, FormData>(
            contactAction, 
            { errors: {} }
        );

    useEffect(()=> {
        if (state.message) {
            setNotification({
                status: state.success ? "success" : "error",
                text: state.message ?? "unknown"
            });
        }

        if (state.success && state.redirectLink) {
            window.open(state.redirectLink, "_blank");
        }
    }, [
        state.success, 
        state.message, 
        state.redirectLink,
        setNotification
    ])

    return (
        <div
            className={s.centralize}
        >
            <AscendingImagesBackground />
            <article
                className={s.contact_form_window}
            >
                <h1 className={cn(
                    s.title,
                    tinyFive.className
                )}>
                    Contact via Whatsapp
                </h1>
                <form 
                    action={action}
                    className={s.form_container}
                >
                    {forms.map(form=>
                        <InputLite
                            key={form.name}
                            name={form.name}
                            label={form.label}
                            placeholder={form.placeholder}
                            options={form.options}
                            error={
                                state.errors 
                                && 
                                state.errors[form.name as keyof FormError]
                                &&
                                state.errors[form.name as keyof FormError]
                            }
                            colSpan={2}
                        />
                    )}
                    <div className="col-span-2 flex justify-center">
                        <LinkBtn
                            withArrow
                            icon="link"
                            size="lg"
                            type="submit"
                            className="rounded-md"
                        >
                            {pending 
                                ? <CircularProgress
                                    color="inherit"
                                    size={30}  
                                />
                                : "Contact"}
                        </LinkBtn>
                    </div>
                </form>
            </article>
        </div>
    )
}
