"use client";

import { cn } from "@/helpers";
import { useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react"
import { motion } from "framer-motion";

export const ScrollShiftDown = ({
    children,
    className
}: {
    children: ReactNode;
    className?: string;
})=> {
    const ref = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end end"]
    });
    const scale = useTransform(
        scrollYProgress,
        [0, 1],
        [1.5, 1]
    );
    const translateY = useTransform(
        scrollYProgress,
        [0, 1],
        ["-10", "10%"]
    );

    return (
        <div
            className={cn(
                className,
                "h-[120vh] w-full overflow-hidden"
            )}
            ref={ref}
        >
            <motion.div
                className="h-screen"
                style={{
                    scale,
                    translateY,
                }}
            >
                {children}
            </motion.div>
        </div>
    )
}
