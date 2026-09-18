"use client";

import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useContext } from "react";
import cn from 'classnames';
import { GlobalContext } from "@/app/[locale]/context/global.context";

interface BWInterface extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>{
    children: ReactNode
}

export const BlurWrapper = ({children, className, ...props}: BWInterface)=> {
    const { blur } = useContext(GlobalContext);

    return (
        <div 
            {...props}
            className={cn(className, { 
                ['pointer-events-none blur-sm']: blur
            })}
        >
            {children}
        </div>
    );
};
