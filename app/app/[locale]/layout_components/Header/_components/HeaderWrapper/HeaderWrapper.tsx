"use client";

import { 
    Transition, 
    useMotionValueEvent, 
    useScroll,
    motion,
} from "framer-motion";
import { ReactNode, useState } from "react";
import s from "../../style.module.scss";

export const HeaderWrapper = ({
    children
}: {
    children: ReactNode;
})=> {
    const { scrollY } = useScroll();
    const [isInitialAnimation, setIsInitialAnimation] = useState(true);
    const [isNavConcealed, setIsNavConcealed] = useState(false);

    const appearenceTrans: Transition = {
        delay: 1,
        duration: 0.5,
        ease: [0.5, 1, 0.89, 1],
    };
    const scrollTrans: Transition = {
        duration: 0.35,
        ease: [0.5, 1, 0.89, 1],
    };

    useMotionValueEvent(scrollY, "change", (current)=> {
        const prevValue = (scrollY.getPrevious() ?? 0);

        if (current <= 300 || current < prevValue) {
            setIsNavConcealed(false);
        } else {
            setIsNavConcealed(true)
        }
    });

    return (
        <motion.div
                    viewport={{
                        once: true
                    }}
                    className={s.back_blur}
                    initial={{
                        translateY: "-150%"
                    }}
                    animate={{
                        translateY: isNavConcealed ? "-150%" : "0%"
                    }}
                    transition={isInitialAnimation
                        ? appearenceTrans
                        : scrollTrans
                    }
                    onAnimationComplete={()=> setIsInitialAnimation(false)}
        >
            {children}
        </motion.div>
    )
}