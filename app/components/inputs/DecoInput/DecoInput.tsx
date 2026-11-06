import { cn } from "@/helpers";
import { DetailedHTMLProps, InputHTMLAttributes } from "react"
import s from "./style.module.scss";

export type DecoInputType 
    = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const DecoInput = ({className, ...props}: DecoInputType)=> {
    const isCheckbox = props.type === "checkbox" || props.type === "radio";

    return (
        <input
            className={cn(
                className, 
                !isCheckbox && s.input
            )}
            {...props}
        />
    )
}
