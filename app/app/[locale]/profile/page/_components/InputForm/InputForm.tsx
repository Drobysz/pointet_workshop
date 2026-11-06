"use client";

import { Id } from "@/api/types/api";
import s from "./style.module.scss";
import { ChangeEvent, useContext, useState } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { User, UserResponse } from "@/api/types/user";
import { UserField, createUserFieldSchemas } from "@/auth/FormSchemes";
import { DecoInput } from "@/components";
import { usePhotonSuggestions } from "@/hooks";
import { 
    SuggestionList,
    InputBtn
} from "./_components";
import { useTranslations } from "next-intl";

export const InputForm = ({
    userId,
    label,
    successMessage,
    initialValue,
    param,
    inputType="text",
    placeholder,
    request
}: {
    userId: Id;
    /** Translated field name shown above the input. */
    label: string;
    /** Translated notification shown once the field is saved. */
    successMessage: string;
    initialValue: string;
    param: UserField;
    inputType?: "email" | "text";
    placeholder?: string;
    request: (
        id: Id, 
        params: Partial<User>
    )=> Promise<UserResponse>;
})=> {
    const t = useTranslations();
    const { setNotification, mutateUser } = useContext(GlobalContext);
    const [value, setValue] = useState(initialValue);
    const [suggestionSelected, setSuggestionSelected] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const { suggestions } = usePhotonSuggestions({
        isActive: param == "address",
        value: value,
    });

    const isButtonDisabled = value.trim() === initialValue;
    const schema = createUserFieldSchemas(t)[param];
    const showSusggestions 
        = param == "address" 
            && suggestions.length > 0
            && suggestionSelected;

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
                text: successMessage
            });
        } catch (error) {

            setNotification({
                status: "error",
                text: getApiErrorMessage(error, t)
            });
        } finally {
            setIsPending(false);
        };
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>)=> {
        setValue(e.target.value);
        setSuggestionSelected(true);
    }

    const handleSuggestionClick = (address: string)=> {
        setValue(address);
        setSuggestionSelected(false);
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
                <div className="relative max-md:flex-1 max-md:min-w-0">
                    <DecoInput
                        className={s.input}
                        value={value}
                        type={inputType}
                        placeholder={placeholder ?? ""}
                        onChange={handleChange}
                    />

                    {showSusggestions &&
                        <SuggestionList 
                            suggestions={suggestions}
                            handleSuggestionClick={handleSuggestionClick}
                        />
                    }
                </div>

                <InputBtn 
                    pending={isPending}
                    buttonDisabled={isButtonDisabled}
                />
            </div>
        </form>
    )
}
