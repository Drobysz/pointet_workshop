"use client";

import {
    Transition,
    motion,
} from "framer-motion";
import { ReactNode } from "react";
import s from "../../style.module.scss";

export const HeaderWrapper = ({
    children
}: {
    children: ReactNode;
})=> {
    const appearenceTrans: Transition = {
        delay: 1,
        duration: 0.5,
        ease: [0.5, 1, 0.89, 1],
    };
    return (
        <motion.div
            data-site-header
            viewport={{
                once: true
            }}
            className={s.back_blur}
            initial={{
                translateY: "-150%"
            }}
            animate={{
                translateY: "0%"
            }}
            transition={appearenceTrans}
        >
            {children}
        </motion.div>
    )
}
