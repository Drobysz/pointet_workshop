import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { ReactNode } from "react"

export const ErrorTitle = ({
    children
}: {
    children: ReactNode;
})=> {
    return (
        <div className="h-[20vh] flex items-center justify-center">
            <h2
                className={cn(
                    jersey10.className,
                    "text-5xl text-zinc-600"
                )}
            >
                {children}
            </h2>
        </div>
    )
}