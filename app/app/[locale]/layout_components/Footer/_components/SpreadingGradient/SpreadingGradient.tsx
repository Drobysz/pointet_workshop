"use client";

import { 
    motion,
    MotionValue,
    useTransform,
} from "framer-motion";

import s from "./style.module.scss";

export const SpreadingGradient = ({
    progress,
}: {
    progress: MotionValue<number>
})=> {
    const height = useTransform(
        progress,
        [0, 1],
        ["0vh", "100vh"],
    );

    return (
        <motion.div 
            className={s.upper_blur_background}
            style={{
                background:
                    `linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0) 0%,
                        rgba(251, 44, 54, 1) 100%
                    )`,
                height,
            }}
        />
    )
}
