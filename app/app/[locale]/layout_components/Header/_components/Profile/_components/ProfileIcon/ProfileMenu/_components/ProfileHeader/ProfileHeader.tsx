import { after } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";

export const ProfileHeader = ({
    email,
    full_name,
}: {
    email: string;
    full_name: string;
})=> {
    return (
        <header
            className={s.user_info_header}
        >
            <span
                className={cn(
                    s.full_name,
                    after.className
                )}
            >
                {full_name}
            </span>
            <span
                className={s.email}
            >
                {email}
            </span>
        </header>
    )
}