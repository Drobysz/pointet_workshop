import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface InteractionCardProps 
extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>{
    children: ReactNode;
    className?: string;
    link?: string;
}
