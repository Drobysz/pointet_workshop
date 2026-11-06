"use client";

import { ChevronLeft, ChevronRight } from "lucide-react"
import s from "./style.module.scss";
import { motion, Transition } from "framer-motion";
import cn from "classnames";
import { useWindowWidth } from "@/hooks";
import { MouseEvent } from "react";
import { useTranslations } from "next-intl";

export const Switchers = ({
    imgIdx,
    setImgIdx,
    lastIdx,
    hover
}: {
    imgIdx: number;
    setImgIdx: (idx: number) => void;
    lastIdx: number;
    hover: boolean;
}) => {
    const t = useTranslations("ui.imageSlider");
    const isDesktop = useWindowWidth(768) as boolean;
    const isVisible = isDesktop && hover;
    const transition: Transition = { duration: 0.2, ease: "easeInOut" };

    const handleLeftClick = (
        e: MouseEvent<HTMLButtonElement>
    )=> {
        e.stopPropagation();
        e.preventDefault();

        setImgIdx(Math.max(0, imgIdx - 1));
    };

    const handleRightClick = (
        e: MouseEvent<HTMLButtonElement>
    )=> {
        e.stopPropagation();
        e.preventDefault();

        setImgIdx(Math.min(lastIdx, imgIdx + 1));
    };

    return (
        <>
            <motion.button
                hidden={!isVisible}
                className={cn(
                    s.switcher_left,
                    imgIdx === 0 && s.switcher_blocked
                )}
                aria-label={t("previous")}
                onClick={handleLeftClick}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : -20,
                }}
                transition={transition}
            >
                <ChevronLeft
                    size={20} 
                    color={imgIdx === 0 ? "gray" : "black"}
                />
            </motion.button>
            <motion.button 
                hidden={!isVisible}
                className={cn(
                    s.switcher_right,
                    imgIdx === lastIdx && s.switcher_blocked
                )}
                aria-label={t("next")}
                onClick={handleRightClick}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : 20,
                }}
                transition={transition}
            >
                <ChevronRight
                    size={20} 
                    color={imgIdx === lastIdx ? "gray" : "black"}
                />
            </motion.button>
        </>
    )
}
