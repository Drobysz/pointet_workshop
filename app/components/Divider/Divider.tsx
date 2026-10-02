import { cn } from "@/helpers";
import s from "./style.module.scss";

export const Divider = ({
    className
}: {
    className?: string;
})=> {
    return (
        <div className={s.divider_wrapper}>
            <hr
                className={cn(
                    s.divider,
                    className
                )}
            />
        </div>
    )
}
