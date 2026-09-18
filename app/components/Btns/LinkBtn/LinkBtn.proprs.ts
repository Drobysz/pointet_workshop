import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

export interface LinkBtnProps
extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    size?: "lg" | "md" | "sm";
    children: ReactNode;
    color?: "gray" | "green" | "white";
    withArrow?: boolean;
    className?: string;
    icon?: "arrow" | "link" | "plus" | "minus";
}
