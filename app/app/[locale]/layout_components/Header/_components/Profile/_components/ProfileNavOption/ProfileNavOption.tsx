import { ReactNode } from "react";
import s from "./style.module.scss";
import { ActiveQuantityTag } from "@/components";
import { Link } from "@/i18n/navigation";

export const ProfileNavOption = ({
    href,
    quantity,
    children
}: {
    href: string;
    quantity: number;
    children : ReactNode;
})=> {
    return (
        <Link
            className={s.icon_btn}
            href={href}
        >
            {children}
            <ActiveQuantityTag
                className="absolute -top-2 -right-0.5 z-10"
                size="small"
                quantity={quantity}
            />
        </Link>
    )
}