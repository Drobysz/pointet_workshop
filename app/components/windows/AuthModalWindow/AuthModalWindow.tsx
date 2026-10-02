"use client";

import s from "./style.module.scss";
import { cn } from "@/helpers";
import { AuthModalWindowProps } from "./AuthModalWindow.props";
import { useContext } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import Cross from "@/assets/close.svg";

export const AuthModalWindow = ({
    className,
    children
}: AuthModalWindowProps)=> {
    const { setPopUpWindow } = useContext(GlobalContext);

    return (
        <article
            className={cn(
                s.auth_window,
                className,
            )}
        >
            <div className="flex justify-end">
                <button 
                    className={s.cross_frame}
                    onClick={()=> setPopUpWindow("none")}
                >
                    <Cross 
                        className="text-neutral-500"
                    />
                </button>
            </div>
            {children}
        </article>
    )
}