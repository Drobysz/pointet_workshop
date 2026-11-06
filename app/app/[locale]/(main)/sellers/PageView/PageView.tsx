"use client";

import AscendingImagesBackground from "@/components/backgrounds/AscendingImagesBackground/AscendingImagesBackground"
import { useActionState, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError, FormState } from "./form/FormScheme";
import s from "./style.module.scss";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { contactAction } from "./form/contactAction";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";
import {
    FormBtn,
    InputList,
} from "./_components";
import { SellerRequestFormState } from "./types";
import { initialSellerRequestFormState } from "./helpers";

export const PageView = ()=> {
    const t = useTranslations();
    const { setNotification } = useContext(GlobalContext);
    
    const [formData, setFormData] = useState<SellerRequestFormState>(
        initialSellerRequestFormState
    );
    const [errors, setErrors] = useState<FormError | null>(null);

    const [state, action, pending] = 
        useActionState<FormState, FormData>(
            contactAction.bind(null, t), 
            { errors: {} }
        );

    useEffect(()=> {
        const resetForm = ()=> {
            setFormData(initialSellerRequestFormState);
            setErrors(null);
        }

        const updateErrors = ()=> {
            setErrors(state.errors ?? null);
        }

        if (state.success == true) {
            resetForm();

            const message = state.message 
                ?? t("seller.submission.sentFallback");

            setNotification({
                status: "success",
                text: message
            });
        } else if (state.success !== undefined) {
            updateErrors();

            const message = state.message 
                ?? t("seller.submission.failedFallback");

            setNotification({
                status: "alert",
                text: message, 
            });
        }
    }, [state, setNotification, t]);
   
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
                    {t("seller.form.title")}
                </h1>

                <form 
                    action={action}
                    className={s.form_container}
                >
                    <InputList 
                        errors={errors ?? null}
                        formData={formData}
                        setFormData={setFormData}
                    />

                    <FormBtn
                        pending={pending}
                    />                   
                </form>
            </article>
        </div>
    )
}
