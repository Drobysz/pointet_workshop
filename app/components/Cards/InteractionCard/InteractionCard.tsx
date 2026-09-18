"use client";

import s from "./style.module.scss";
import { cn } from "@/helpers";
import { InteractionCardProps } from "./InteractionCard.props";
import { Link } from "@/i18n/navigation";

export const InteractionCard = ({
    link,
    children,
    className,
    ...props
}: InteractionCardProps)=> {
    return (
        <article
            {...props}
            className={cn(
                s.card,
                !link && cn(
                    "cursor-pointer", className
                ),
            )}
        >
            {link &&
                <Link
                    href={link}
                    className={cn(link && className)}
                >
                    {children}
                </Link>
            }
            {!link && children}
        </article>
    )
}
