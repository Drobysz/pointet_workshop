"use client";

import { motion } from "framer-motion";
import { cn } from "@/helpers";
import { Fragment, ReactNode } from "react";
import s from "./style.module.scss";


export const CoverFeed = ({
    hover,
    children,
    className,
}: {
    hover: boolean;
    children: ReactNode;
    className?: string;
})=> {
    return (
       <span
            className={cn(
                className,
                s.cover_sign, {
                    ["translate-y-0"]: hover,
                    ["-translate-y-10"]: !hover,
                }
            )}
        >
            <motion.span
                className={s.feed}
                animate={{
                    x: ["-50%", "0%"]
                }}

                transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                {Array(2).fill(true).map((_, i)=>
                    <span
                        key={`nav_feed_els_group_${i}`}
                        className={s.feed_group}
                    >
                        {Array(3).fill(true).map((_, i)=>
                            <Fragment key={`nav_feed_el_${i}`}>
                                <span>{children}</span>
                                <span>•</span>
                            </Fragment>
                        )}
                    </span>
                )}
            </motion.span>
        </span> 
    )
}