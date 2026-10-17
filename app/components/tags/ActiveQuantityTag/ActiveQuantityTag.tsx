import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";

export const ActiveQuantityTag = ({
    quantity
}: {
    quantity: number;
})=> {
    return (
        <span className={cn(
            "relative text-white",
            jersey10.className
        )}>
            <span>
                {quantity}
            </span>
            <span 
                className="
                    absolute
                    -z-10
                    bg-red-500 
                    rounded-full 
                    h-5 w-5
                    top-1/2 
                    left-1/2 
                    -translate-1/2
                "
            />
        </span>
    )
}
