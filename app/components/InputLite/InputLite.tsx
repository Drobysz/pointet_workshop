'use client';

import { after, climate_crisis, cutiveMono, inter_regular, monserrat_regular, sixCaps, tinyFive } from "@/fonts/fonts";
import { InputLiteProps } from "./InputLite.props";
import s from "./inputlite.module.scss";
import cn from "classnames";

export const InputLite = ({
    placeholder,
    name,
    type,
    label,
    error,
    options,
    colSpan,
    className,
    ...props
}: InputLiteProps) => {
    const listId = `${name}-opts`;

    return (
        <label className={cn(
            s.form_content_container,
            colSpan === 2 && "col-span-2",
            colSpan === 1 && "col-span-1"
        )}>
            <div className="flex gap-3 items-center-safe">
                {label && 
                    <span className={cn(
                        s.label,
                        tinyFive.className
                    )}>
                        {label}
                    </span>
                }
                {error &&
                    <span className="text-sm text-red-600">
                        {error}
                    </span>
                }
            </div>

            <input
                {...props}
                type={type}
                placeholder={placeholder}
                name={name}
                list={options ? listId : undefined}
                
                className={cn(
                    s.input_container,
                    className,
                    monserrat_regular.className
                )}
            />

            {options && (
                <datalist id={listId}>
                    {options.map(v=> <option key={`opt-${v}`}>{v}</option>)}
                </datalist>
            )}
        </label>
    );
};
