import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";

export const ActiveQuantityTag = ({
    quantity,
    className,
    size="middle"
}: {
    quantity: number;
    className?: string;
    size?: "middle" | "small" 
})=> {
    return (
        <div className={className}>
            <span className={cn(
                s.tag,
                jersey10.className, {
                    ["text-sm"]: size == "small",
                    ["text-base"]: size == "middle",
                },
            )}>
                <span className={cn(size == "small" && "pl-px")}>
                    {quantity}
                </span>
                <span 
                    className={cn(s.tag__background, {
                        ["w-4 h-4"]: size == "small",
                        ["w-5 h-5"]: size == "middle",
                    })}
                />
            </span>
        </div>
    )
}
