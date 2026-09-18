"use client";

import { useContext, useEffect, useRef, useState } from "react";
import s from "./style.module.scss";
import { useMouseCoordinates } from "@/hooks";
import { motion, Transition } from "framer-motion";
import { GlobalContext } from "@/app/[locale]/context/global.context";

export const MouseGuide = ()=> {
    const { mouseText } = useContext(GlobalContext);
    const [visible, setVisible] = useState(false);
    const [isEnoughSpaceRight, setIsEnoughSpaceRight] = useState(true);
    const {x, y} = useMouseCoordinates(visible);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        const updateMouseGuideText = async ()=> {
            if (!mouseText) {
                setVisible(false);
                return;
            };

            setVisible(true);
        }

        updateMouseGuideText();

        const timoutId = setTimeout(() => {
            setVisible(false);
        }, 3000);

        return ()=> clearTimeout(timoutId);
    }, [mouseText]);

    useEffect(() => {
        const element = ref.current;

        if (!element || !mouseText || !visible) return;

        const windowWidth = window.innerWidth;
        const elementRightEdge = x + element.offsetWidth;

        setIsEnoughSpaceRight(elementRightEdge < windowWidth);
    }, [mouseText, x, visible]);

    if (!mouseText) return null;

    const variants = {
        "visible": {
            opacity: 1,
            scale: 1,
            x: isEnoughSpaceRight ? 12 : "-110%",
            y: 22,
        },
        "unvisible": {
            opacity: 0,
            scale: 0.5,
            x: 0,
            y: 8,
        }
    }

    const transition: Transition = { 
        type: "spring", 
        bounce: 0.25, 
        duration: 0.7 
    };

    return (
        <motion.div 
            className={s.body}
            ref={ref}
            style={{
                left: x,
                top: y
            }}
            initial={"unvisible"}
            animate={visible ? "visible" : "unvisible"}
            variants={variants}
            transition={transition}
        >
            {mouseText}
        </motion.div>
    )
}
