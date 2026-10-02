import { after } from "@/fonts/fonts"
import { cn } from "@/helpers"
import s from "./style.module.scss";

export const Title = ({
    title
}: {
    title : string;
})=> {
    return (
        <h1
            className={cn(
                after.className,
                s.title,
            )}
        >
            {title}
        </h1>
    )
}