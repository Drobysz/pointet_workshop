import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface GridContainerInterface
extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
{
    outerClassName?: string;
    innerClassName?: string;
    children?: ReactNode;
};
