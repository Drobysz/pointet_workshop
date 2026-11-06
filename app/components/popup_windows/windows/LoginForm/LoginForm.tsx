"use client";

import { ShadowBorderWindow } from "@/components/windows/ShadowBorderWindow/ShadowBorderWindow"
import s from "./style.module.scss";
import { ChangeEvent, useActionState, useContext, useEffect } from "react";
import { Submit } from "./_components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import { Input } from "@/components/inputs/Input/Input";
import { inputType } from "@/components/inputs/Input/Input.props";
import { FormError, FormState } from "@/auth/FormSchemes";
import { loginAction } from "@/auth/actions/loginAction";
import { useTranslations } from "next-intl";

export const LoginForm = ()=> {
    const t = useTranslations();

    const loginForms = [
        { label: t("auth.fields.email"), name: "email", type: "email", placeholder: "your_email@example.com" },
        { label: t("auth.fields.password"), name: "password", type: "password", placeholder: "Test123!" },
    ];
    
    const { 
        logFormData,
        setLogFormData,
        setNotification,
        setAuthStatus,
        setPopUpWindow,
        mutateUser,
    } = useContext(GlobalContext);

    const areInputsFilled = Object
        .values(logFormData)
        .every(value => value.trim() !== "");

    const handleForm = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setLogFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const [state, action, pending] = 
        useActionState<FormState, FormData>(
            loginAction.bind(null, t), 
            { errors: {} }
        );
    
    useEffect(()=> {
        if (!state.message) return;

        if (state.success) {
            setAuthStatus("authenficated");
            mutateUser();
            setPopUpWindow("none");
        }

        setNotification({
            status: state.success 
                ? "success" : "error",
            text: state.message
        });
    }, [
        state, 
        setNotification,
        setAuthStatus,
        setPopUpWindow,
        mutateUser,
    ]);

    return (
        <ShadowBorderWindow>
            <form
                className={s.form}
                action={action}
            >
                <h2 className={cn(
                    s.title,
                    tinyFive.className
                )}>
                    {t("auth.login.title")}
                </h2>
                <div className={s.input_list}>
                    {loginForms.map((form, idx)=>
                        <Input
                            key={`input-${form.name}-${idx}`}
                            type={form.type as inputType}
                            placeholder={form.placeholder}
                            label={form.label}
                            name={form.name}
                            onChange={handleForm}
                            error={
                                state.errors && state.errors[form.name as keyof FormError]
                                &&
                                state.errors[form.name as keyof FormError]
                            }
                        />
                    )}
                </div>
                <div
                    className={s.submit_container}
                >
                    <Submit 
                        isFilled={areInputsFilled}
                        isPending={pending}
                    />
                </div>
            </form>
        </ShadowBorderWindow>
    )
}
