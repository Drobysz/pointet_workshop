'use client';

import cn from "classnames";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { InputProps } from "./Input.props";
import s from "./input.module.scss";
import { jersey10 } from "@/fonts/fonts";
import { usePhotonSuggestions } from "@/hooks";
import { SuggestionList } from "./components";

export const Input = ({
    placeholder,
    type,
    label,
    error,
    value,
    className,
    ...props
}: InputProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { suggestions } = usePhotonSuggestions({
        isActive: props.name == "address",
        value: String(value ?? ""),
    });

    const [conceal, setConceal] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const t = useTranslations("common.password");

    const showSusggestions 
        = props.name == "address" 
            && suggestions.length > 2
            && isFocused;
    
    let inputType = type;
    if (type === "password") {
        inputType = conceal ? "password" : "text"
    };

    const errorId = error && props.name 
        ? `${props.name}-error` : undefined;

    const handleSuggestionClick = (value: string)=> {
        const el = inputRef.current;
        if (!el) return;


        const nativeSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        )?.set;

        nativeSetter?.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));

        el.blur();
    }

    return (
        <label className={s.form_content_container}>
            <div className="flex gap-3 items-center-safe">
                {label && 
                    <span className={cn(
                        s.label,
                        jersey10.className
                    )}>
                        {label}
                    </span>
                }
                {error &&
                    <span id={errorId} className={s.error}>
                        {error}
                    </span>
                }
            </div>
            
            <div className="relative">
                <input
                    {...props}
                    ref={inputRef}
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                    className={cn(s.input_container, className)}

                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}   
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setConceal((prev) => !prev)}
                        className={s.eye}
                        aria-label={conceal ? t("show") : t("hide")}
                    >
                        {conceal ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                )}

                {showSusggestions && (
                    <SuggestionList 
                        suggestions={suggestions}
                        handleSuggestionClick={handleSuggestionClick}
                    />
                )}
            </div>
        </label>
    );
};
