"use client";

import { tinyFive } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { ReactNode } from "react";
import s from "./style.module.scss";

export const Title = ({
    isHovered,
    children
}: {
    isHovered: boolean;
    children : ReactNode;
})=> {
    const name = (children as string).length > 20
        ? (children as string).slice(0, 20) + "..."
        : children;

    return (
        <h2
            className={cn(
                tinyFive.className,
                s.title,
                isHovered && s.title_covered
            )}
        >
            {name}
        </h2>
    )
}