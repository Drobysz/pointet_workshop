"use client";

import type { FormError } from "../../form/FormScheme";
import { InputLite } from "@/components";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { sellerFormFields } from "../../form/fields";
import { SellerRequestFormState } from "../../types";

export const InputList = ({
    pending = false,
    errors,
    formData,
    setFormData,
}: {
    pending?: boolean;
    errors: FormError | null;
    formData: SellerRequestFormState,
    setFormData: Dispatch<SetStateAction<SellerRequestFormState>>,

})=> {
    const t = useTranslations("seller.form");

    const handleChange = (e: ChangeEvent<HTMLInputElement>)=> {
        const name = e.target.name;
        const enterValue = name === "is_resident_of_eu" 
            ? e.target.checked
            : e.target.value;

        setFormData(prev => ({
            ...prev,
            [name as keyof SellerRequestFormState]: enterValue 
        }));
    }

    return (
        <>
            {sellerFormFields.map(field => {
                const value = formData[field.name];
                const error = errors?.[field.name];
                const colSpan = 
                    field.name == "description_of_brand" ? 2 : 1

                return (
                    <InputLite
                        key={field.name}
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        label={t(`labels.${field.labelKey}`)}
                        placeholder={field.placeholderKey
                            ? t(`placeholders.${field.placeholderKey}`)
                            : field.placeholder}
                        value={typeof value === "string" ? value : undefined}
                        checked={typeof value === "boolean" ? value : undefined}
                        disabled={pending}
                        error={error}
                        className="text-base!"
                        colSpan={colSpan}
                        onChange={handleChange}
                    />
                )
            })}
        </>
    );
};
