"use client";

import { cn } from "@/helpers";
import { useEffect, useRef, useState } from "react";
import { 
    ArrowRight,
    SquareArrowOutUpRight,
    Plus,
    Minus,
} from "lucide-react";
import { LinkBtnProps } from "./LinkBtn.proprs";

export const LinkBtn = ({
    size="md",
    color="gray",
    withArrow=false,
    icon="arrow",
    className,
    children,
    ...props
}: LinkBtnProps)=> {
    const [hover, setHover] = useState(false);
    const [signWidth, setSignWidth] = useState(0);
    const ref = useRef<HTMLSpanElement | null>(null);

    const transitionFast = "transition-transform duration-150 ease-in";
    const transitionSlow = "transition-transform duration-450 ease-out";
    const iconSizes = {
        ["scale-75"]: size === "lg",
        ["scale-65"]: size === "md",
        ["scale-64"]: size === "sm",
    };
    const icons = {
        "arrow": ArrowRight,
        "link": SquareArrowOutUpRight,
        "plus": Plus,
        "minus": Minus
    }
    const widthBufferSizeGrid = {
        "lg": 36,
        "md": 24,
        "sm": 20,
    };

    const btnWidth = withArrow 
        ? `${signWidth + widthBufferSizeGrid[size]}px` 
        : "fit-content";
    
    const BtnIcon = icons[icon];

    useEffect(()=>{
        if (!ref.current) return;
        setSignWidth(ref.current.offsetWidth);

    }, [])

    return (
        <button
            {...props}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
            className={cn(
                "backdrop-blur-3xl w-fit shrink-0", 
                "overflow-hidden relative", 
                "inline-flex items-center",
                "transition-transform duration-150", 
                "active:scale-95", {
                    ["font-medium text-xl px-4.5 py-2 rounded-2xl"]: size === "lg",
                    ["text-base px-3 py-1.5 rounded-xl"]: size === "md",
                    ["text-sm px-2 py-1 rounded-xl"]: size === "sm",

                    ["bg-gray-400/10 hover:bg-gray-500/30 text-white"]: color === "gray",
                    ["bg-primary-400/10 hover:bg-primary-400/30 text-white"]: color === "green",
                    ["bg-white hover:bg-white/90 text-black"]: "white",
                },
                className,
            )}
            style={{ width: btnWidth }}
        >
            {withArrow &&
                <span
                    className={cn(
                        "inline-flex items-center gap-2 shrink-0",
                        transitionFast,
                        hover 
                            ? "-translate-x-4" 
                            : "-translate-x-7.5"
                    )}
                >
                    <BtnIcon
                        className={cn(
                            "pt-0.5",
                            transitionSlow,
                            iconSizes,
                            hover 
                                ? "translate-x-3" 
                                : "-translate-x-2" 
                        )}
                    />
                    <span
                        ref={ref}
                        className={cn(
                            transitionSlow,
                            "inline-flex items-center gap-2 shrink-0",
                            hover && "translate-x-0.5"  
                        )}
                    >
                        {children}
                        <BtnIcon
                            className={cn(
                                "scale-65 pt-0.5",
                                transitionFast,
                                iconSizes,
                                hover && "translate-x-5" 
                            )}
                        />
                    </span>
                </span>
            }
            {!withArrow && 
                children
            }
        </button>
    )
}
