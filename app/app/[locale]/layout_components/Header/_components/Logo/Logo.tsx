import { after } from "@/fonts/fonts"
import { cn } from "@/helpers"
import s from "../../style.module.scss";

export const Logo = ()=> {
    return (
        <p 
            className={cn(
                after.className,
                s.logo_title
            )}
        >
            Pointet
        </p>
    )
}