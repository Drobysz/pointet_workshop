import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { ReactNode } from "react"
import s from "./style.module.scss";

export const PriceTag = ({
    isHovered,
    children
}: {
    isHovered: boolean;
    children: ReactNode;
})=> {
    return (
        <p className={cn(
            jersey10.className,
            s.price_tag,
            isHovered 
                ? "from-amber-200 to-amber-600 to-100%"
                : "from-zinc-300 to-zinc-700 from-15%"
        )}>
            <span className={s.price_tag__number}>
                {children}
            </span>

            <span className={s.price_tag__currency}>
                €
            </span>
        </p>
    )
}