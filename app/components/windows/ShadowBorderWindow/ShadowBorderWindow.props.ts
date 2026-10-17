import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface ShadowBorderWindowProps
extends DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>, HTMLDivElement
> {
    withoutCross?: boolean;
    withoutGradient?: boolean;
    className?: string;
    children: ReactNode;
}
