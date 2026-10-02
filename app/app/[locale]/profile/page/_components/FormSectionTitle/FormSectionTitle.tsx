import { after } from "@/fonts/fonts"
import { cn } from "@/helpers"
import s from "./style.module.scss";
import { ReactNode } from "react";

export const FormSectionTitle = ({
    children
}: {
    children: ReactNode;
})=> {
    return (
        <h2
            className={cn(
                s.form_section_title,
                after.className
            )}
        >
            {children}
        </h2>
    )
}