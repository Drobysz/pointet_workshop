"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import s from "./style.module.scss";
import { useAnimate, motion, Transition, useInView } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { climate_crisis, sixCaps } from "@/fonts/fonts";
import { SplitByRowsText } from "@/components/animations/Texts/SplitByRowsText/SplitByRowsText";

export const Hero = ()=> {
    const t = useTranslations("home.hero");
    // The tagline is one message; its line breaks define the animated rows.
    const taglineRows = t("tagline").split("\n");
    const [scope, animate] = useAnimate();
    const ref = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(ref, { once: true });

    const [hover, setHover] = useState(false);
    const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event: MouseEvent<HTMLElement>)=> {
        const { clientX, clientY } = event;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = (clientX - (rect.left + rect.width / 2)) / 80;
        const y = (clientY - (rect.top + rect.height / 2)) / 80;

        setMouseCoord({ x, y });
    };

    const handleMouseEnter = ()=> {
        setHover(true);
    };

    const handleMouseLeave = ()=> {
        setHover(false);
        setMouseCoord({ x: 0, y: 0});
    };

    const getCoordinatesStyle = (
        positive: boolean,
        extender: number
    )=> {
        const sign = positive ? 1 : -1;

        return {
            transform: hover
                ? `translate3d(${mouseCoord.x * sign * extender}px, ${-mouseCoord.y * sign * extender}px, 0) scale3d(1.015, 1.015, 1)`
                : `translate3d(0px, 0px, 0) scale3d(1, 1, 1)`,
            transition: "transform 0.1s ease-out",
        }
    }

    useEffect(()=> {
        if (!isInView) return;

        const appearenceTrans: Transition = {
            duration: 1,
            ease: [0.34, 1.56, 0.64, 0.85],
        };
        
        async function runSequence() {
            await animate(
                scope.current, 
                { translateY: "0%" },
                appearenceTrans,
            );

            await animate(
                scope.current, 
                { scale: 1 },
                appearenceTrans,
            );
        };

        runSequence();
    }, [isInView, scope, animate]);

    return (
        <motion.section
            ref={ref}
            className={s.wrapper}
        >
            <motion.div
                ref={scope}
                className={s.window}
                initial={{
                    scale: 0.7,
                    translateY: "30%"
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className={s.content_container}>
                    <motion.h1 
                        className={cn(
                            s.title,
                            sixCaps.className
                        )}
                        style={getCoordinatesStyle(false, 1.5)}
                    >
                        pointet
                    </motion.h1>
                    <div 
                        className={s.images_container}
                        style={getCoordinatesStyle(true, 1)}
                    >
                        <Image
                            className={s.bag}
                            src="/hero/bag.png"
                            width={720}
                            height={550}
                            alt={t("bagAlt")}
                            loading="eager"
                        />
                        <Image
                            className={s.chest}
                            src="/hero/chest.png"
                            width={800}
                            height={400}
                            alt={t("shelfAlt")}
                            loading="eager"
                        />
                    </div>
                    <motion.ul
                        className={cn(
                            s.signs_list,
                            climate_crisis.className
                        )}
                        style={getCoordinatesStyle(true, 3.5)}
                    >
                        {taglineRows.map((row, index) =>
                            <SplitByRowsText
                                key={`tagline-row-${index}`}
                                tag="span"
                            >
                                {row}
                            </SplitByRowsText>
                        )}
                    </motion.ul>
                </div>
            </motion.div>
        </motion.section>
    )
}
