'use client';

import cn from "classnames";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { InputProps } from "./Input.props";
import s from "./input.module.scss";
import { jersey10 } from "@/fonts/fonts";

export const Input = ({
    placeholder,
    value,
    type,
    label,
    error,
    className,
    ...props
}: InputProps) => {
    const [conceal, setConceal] = useState(true);
    const t = useTranslations("common.password");
    
    let inputType = type;
    if (type === "password") {
        inputType = conceal ? "password" : "text"
    };

    const errorId = error && props.name 
        ? `${props.name}-error` : undefined;

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
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                    className={cn(s.input_container, className)}
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
            </div>
        </label>
    );
};
