"use client";

import { cn } from "@/helpers";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import s from "./style.module.scss";
import { GlidingImageBackgroundProps } from "./GlidingImageBackground.interface";

export const GlidingImageBackground = ({
    img_url,
    withShadow = false,
    scaling = true,
    className,
    children,
    ...props
}: GlidingImageBackgroundProps)=> {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end 30%"]
    });
    const translateY = useTransform(
        scrollYProgress,
        [0, 1],
        ["-20%", "10%"],
    );

    const scale = useTransform(
        scrollYProgress,
        [0, 1],
        ["1.5", "1.1"],
    );

    return (
        <motion.div
            {...props}
            className={cn(className, "relative overflow-hidden")}
            ref={containerRef}
        >
            <motion.div 
                className="absolute inset-0 h-full w-full"
                style={{
                    translateY: translateY,
                    scale: scaling ? scale : 1.1,
                }}
            >
                {img_url &&
                    <Image
                        className="object-cover"
                        src={img_url}
                        // width={1200}
                        // height={1200}
                        sizes="100vw"
                        fill
                        alt="sliding background image"
                    />
                }
            </motion.div>
            {withShadow &&
                <motion.div
                    className={cn(
                        "absolute inset-0 bg-black/80 pointer-events-none",
                        s.shadow
                    )}
                />
            }
            {children}
        </motion.div>
    )
}