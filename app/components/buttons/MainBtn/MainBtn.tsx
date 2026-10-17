"use client";

import { cn } from "@/helpers"
import { MainBtnProps } from "./MainBtn.props"
import { useState, MouseEvent } from "react";
import s from "./style.module.scss"
import { motion } from "framer-motion";
import { tinyFive } from "@/fonts/fonts";

export const MainBtn = ({
    children,
    className,
    ...props
}: MainBtnProps)=> {
    const [hover, setHover] = useState(false);
    const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event: MouseEvent<HTMLElement>)=> {
        const { clientX, clientY } = event;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = (clientX - (rect.left + rect.width / 2)) / 15;
        const y = (clientY - (rect.top + rect.height / 2)) / 15;

        setMouseCoord({ x, y });
    };

    const handleMouseEnter = ()=> {
        setHover(true);
    };

    const handleMouseLeave = ()=> {
        setHover(false);
        setMouseCoord({ x: 0, y: 0});
    };

    return (
        <motion.button
            {...props}
            className={cn(
                className,
                tinyFive.className,
                s.button,
            )}
            style={{
                transform: hover
                    ? `translate3d(${mouseCoord.x}px, ${mouseCoord.y}px, 0) scale3d(1, 1, 1)`
                    : `translate3d(0px, 0px, 0) scale3d(1, 1, 1)`,
                transition: "transform 0.1s ease-out",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{
                    transform: hover
                        ? `translate3d(${-mouseCoord.x}px, ${-mouseCoord.y}px, 0) scale3d(1.1, 1.1, 1)`
                        : `translate3d(0px, 0px, 0) scale3d(1, 1, 1)`,
                    transition: "transform 0.1s ease-out",
                }}
            >
                {/* btn text */}
                <span
                    className={cn(
                        s.text,
                        hover && "text-zinc-700"
                    )}
                >
                    {children}
                </span>

                {/* btn cover text */}
                <span
                    className={s.cover_text_space}
                >
                    <span className={cn(
                        s.cover_text,
                        hover && s.cover_text_animation
                    )}>
                        {children}
                    </span>
                </span>
            </motion.div>

            {/* background cover */}
            <span 
                className={s.btn_cover_back_space}
            >
                <span 
                    className={cn(
                        s.btn_cover_back,
                        hover && s.back_cover_btn_animation
                    )}
                />
            </span>
        </motion.button>
    )
}
