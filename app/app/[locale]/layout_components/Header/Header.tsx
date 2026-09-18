"use client";

import { GridContainer } from "@/components"
import s from "./style.module.scss";
import { after } from "@/fonts/fonts";
import { cn } from "@/helpers/cn";
import {
    Navigation,
} from "./_components";
import { MainBtn } from "@/components";
import { motion, Transition, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

export const Header = ()=> {
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
                translateY: "-100%"
            }}
            animate={{
                translateY: isNavConcealed ? "-200%" : "0%"
            }}
            transition={isInitialAnimation
                ? appearenceTrans
                : scrollTrans
            }
            onAnimationComplete={()=> setIsInitialAnimation(false)}
        >
                <GridContainer
                    outerClassName={s.header_wrapper}
                    innerClassName={s.header_container}
                >
                    <p 
                        className={cn(
                            after.className,
                            s.logo_title
                        )}
                    >
                        Pointet
                    </p>

                    <Navigation />
                    <MainBtn 
                        className="justify-self-end"
                    >
                        Sign Up
                    </MainBtn>
                </GridContainer>
        </motion.div>
    )
}
