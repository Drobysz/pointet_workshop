"use client";

import { AuthModalWindow } from "@/components/windows/AuthModalWindow/AuthModalWindow"
import s from "./style.module.scss";
import { ChangeEvent, useActionState, useContext, useEffect, useState } from "react";
import { 
    Terms,
    Submit,
} from "./_components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import { Input } from "@/components/Input/Input";
import { inputType } from "@/components/Input/Input.props";
import { FormError, FormState } from "@/auth/FormSchemes";
import { registerAction } from "@/auth/actions/registerAction";

export const RegisterForm = ()=> {
    const registerForms = [
        { label: "Full name", name: "full_name", type: "text", placeholder: "Alex Drobysz" },
        { label: "Email", name: "email", type: "email", placeholder: "your_email@example.com" },
        { label: "Address (optional)", name: "address", type: "text", placeholder: "15 rue de Republic, City, Postal code, Country" },
        { label: "Password", name: "password", type: "password", placeholder: "Test123!" },
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
            registerAction, 
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
        <AuthModalWindow>
            <form
                className={s.form}
                action={action}
            >
                <h2 className={cn(
                    s.title,
                    tinyFive.className
                )}>
                    Registration
                </h2>
                <div className={s.input_list}>
                    {registerForms.map((form, idx)=>
                        <Input
                            key={`input-${form.label}-${idx}`}
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
        </AuthModalWindow>
    )
}
