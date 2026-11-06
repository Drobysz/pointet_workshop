"use client";

import { ShadowBorderWindow } from "@/components/windows/ShadowBorderWindow/ShadowBorderWindow"
import s from "./style.module.scss";
import { ChangeEvent, useActionState, useContext, useEffect, useState } from "react";
import { 
    Terms,
    Submit,
} from "./_components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import { Input } from "@/components/inputs/Input/Input";
import { inputType } from "@/components/inputs/Input/Input.props";
import { FormError, FormState } from "@/auth/FormSchemes";
import { registerAction } from "@/auth/actions/registerAction";
import { useTranslations } from "next-intl";

export const RegisterForm = ()=> {
    const t = useTranslations();

    const registerForms = [
        { label: t("auth.fields.fullName"), name: "full_name", type: "text", placeholder: "Alex Drobysz" },
        { label: t("auth.fields.email"), name: "email", type: "email", placeholder: "your_email@example.com" },
        { label: t("auth.fields.address"), name: "address", type: "text", placeholder: t("auth.fields.addressPlaceholder") },
        { label: t("auth.fields.password"), name: "password", type: "password", placeholder: "Test123!" },
    ];
    
    const { 
        regFormData,
        setRegFormData,
        setNotification,
        setPopUpWindow,
    } = useContext(GlobalContext);
    const [areTermsCheked, setAreTermsChecked] = useState(false);

    const areInputsFilled = Object
        .values(regFormData)
        .every(value => value.trim() !== "");
    const isFormFilled = areInputsFilled && areTermsCheked;

    const handleForm = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setRegFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const [state, action, pending] = 
        useActionState<FormState, FormData>(
            registerAction.bind(null, t), 
            { errors: {} }
        );
    
     useEffect(()=> {
        if (!state.message) return;

        setNotification({
            status: state.success 
                ? "success" : "error",
            text: state.message
        });
        setPopUpWindow("none");
    }, [state, setNotification, setPopUpWindow]);

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
                    {t("auth.register.title")}
                </h2>
                <div className={s.input_list}>
                    {registerForms.map((form, idx)=>
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
                    <Terms
                        areTermsCheked={areTermsCheked}
                        setAreTermsChecked={setAreTermsChecked}
                    />
                    <Submit 
                        isFilled={isFormFilled}
                        isPending={pending}
                    />
                </div>
            </form>
        </ShadowBorderWindow>
    )
}
