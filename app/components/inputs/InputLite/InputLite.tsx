'use client';

import { monserrat_regular, tinyFive } from "@/fonts/fonts";
import type { InputLiteProps } from "./InputLite.props";
import { useId } from "react";
import s from "./inputlite.module.scss";
import cn from "classnames";
import { DecoInput } from "../DecoInput/DecoInput";

export const InputLite = ({
    placeholder,
    name,
    type = "text",
    label,
    error,
    options,
    colSpan,
    className,
    id,
    rows = 3,
    ...props
}: InputLiteProps) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listId = `${inputId}-opts`;
    const errorId = `${inputId}-error`;
    const isCheckbox = type === "checkbox" || type === "radio";
    const isTextarea = type === "textarea";
    const describedBy = [props["aria-describedby"], error ? errorId : undefined]
        .filter(Boolean).join(" ") || undefined;
    const controlProps = {
        ...props,
        id: inputId,
        name,
        placeholder,
        "aria-invalid": error ? true : props["aria-invalid"],
        "aria-describedby": describedBy,
        className: cn(
            isCheckbox ? s.checkbox : s.input_container,
            isTextarea && s.textarea,
            monserrat_regular.className,
            className,
        ),
    };

    return (
        <label
            htmlFor={inputId}
            className={cn(
                isCheckbox && s.checkbox_container,
                !isCheckbox && s.form_content_container,
                (colSpan === 2 && !isCheckbox) && "col-span-2",
                (colSpan === 1 && !isCheckbox) && "col-span-1",
            )}
        >
            {label && 
                <span className={cn(
                    s.label, 
                    tinyFive.className
                )}>
                    {label}
                </span>
            }

            {isTextarea
                ? 
                    <textarea 
                        {...controlProps} 
                        rows={rows} 
                    />
                : 
                    <DecoInput 
                        {...controlProps} 
                        type={type} 
                        list={options ? listId : props.list} 
                    />
            }

            {error && 
                <span 
                    id={errorId} 
                    role="alert" 
                    className={s.error}
                >
                    {error}
                </span>
            }

            {options && !isTextarea && !isCheckbox && (
                <datalist id={listId}>
                    {options.map(v=> 
                        <option key={`opt-${v}`}>
                            {v}
                        </option>
                    )}
                </datalist>
            )}
        </label>
    );
};
