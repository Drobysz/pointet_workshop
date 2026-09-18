"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, ViewTransition } from "react";

export const PageTransition = ({
    children
}: {
    children: ReactNode
})=> {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <ViewTransition>
                <motion.div
                    key={pathname}
                    initial={{ scale: 0.98, filter: "blur(10px)" }}
                    animate={{ scale: 1, filter: "blur(0px)" }}
                    exit={{ scale: 1.01, opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.45, 0, 0.5, 0.72],
                    }}
                >
                    {children}
                </motion.div>
            </ViewTransition>
        </ AnimatePresence>
    )
}