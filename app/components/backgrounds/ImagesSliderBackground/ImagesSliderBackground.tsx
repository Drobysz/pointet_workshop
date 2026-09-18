"use client";

import { ImagesSliderBackgroundProps } from "./ImagesSliderBackground.props"
import { AnimatePresence, motion } from "framer-motion";
import { TRANSITION } from "./framer-values";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const ImagesSliderBackground = ({
    images,
    activeIndex,
    direction,
    children,
    className
}: ImagesSliderBackgroundProps)=> {
    const swipingVariants = {
        "initial": (direction: number)=> ({
            clipPath: direction > 0
                ? "inset(0% 0% 0% 100%)"
                : "inset(0% 100% 0% 0%)"
        }),
        "animate": {
            clipPath: "inset(0% 0% 0% 0%)"
        },
        "exit": (direction: number)=> ({
            clipPath: direction > 0
                ? "inset(0% 100% 0% 0%)"
                : "inset(0% 0% 0% 100%)"
        }),
    };

    const shiftingVariants = {
        "initial": (direction: number)=> ({
            x: direction > 0
                ? "20%"
                : "-20%"
        }),
        "animate": {
            x: "0%"
        },
        "exit": (direction: number)=> ({
            x: direction > 0
                ? "-20%"
                : "20%"
        }),
    };

    return (
        <div className={cn(className, "relative")}>
            <AnimatePresence
                initial={false}
                custom={direction}
            >
                <motion.div
                    className="absolute inset-0 overflow-hidden"
                    key={activeIndex}
                    custom={direction}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={swipingVariants}
                    transition={TRANSITION}
                >
                    <motion.div
                        className="relative w-full h-full"
                        custom={direction}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={shiftingVariants}
                        transition={TRANSITION}
                    >
                        <Image
                            src={images[activeIndex]}
                            fill
                            sizes="100%"
                            className="object-cover"
                            alt="swiping image"
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>
            {children}
        </div>
    )
}