import { ReactNode } from "react";
import s from "./style.module.scss";
import { ActiveQuantityTag } from "@/components";
import { Link } from "@/i18n/navigation";
import { cn } from "@/helpers";

export const ProfileNavOption = ({
    href,
    label,
    quantity,
    className,
    children
}: {
    href: string;
    /** Accessible name, quantity included: the link content is an icon only. */
    label: string;
    quantity: number;
    className?: string;
    children : ReactNode;
})=> {
    return (
        <Link
            className={cn(s.icon_btn, className)}
            href={href}
            aria-label={label}
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
