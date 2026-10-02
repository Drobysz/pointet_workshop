import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface AuthModalWindowProps
extends DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>, HTMLDivElement
> {
    className?: string;
    children: ReactNode;
}
