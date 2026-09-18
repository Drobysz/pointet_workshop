"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { DocCategoryProps } from "./DocCategory.props";
import { motion } from "framer-motion";
import { transition } from "./framer";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cutiveMono, monserrat_medium, tinyFive } from "@/fonts/fonts";

export const DocCategory = ({
    children,
    href,
    isActive,
    cursorVertClickedCoord,
    setCursorVertCoord,
    setCursorVertClickedCoord
}: DocCategoryProps)=> {
    const ref = useRef<HTMLLIElement>(null);
    const [hover, setHover] = useState(false);

    const handleCoordsChange = useCallback(()=> {
        if (ref.current === null) return;

        const { offsetLeft: l, offsetTop: t } = ref.current;
        setCursorVertCoord({left: l, top: t});
    }, [setCursorVertCoord]);

    const handleMouseEnter = ()=> {
        setHover(true);
        handleCoordsChange();
    }

     const handleMouseLeave = ()=> {
        setHover(false);
        setCursorVertCoord(cursorVertClickedCoord);
    } 

    useEffect(()=> {
        if (isActive) {
            if (ref.current === null) return;

            const { offsetLeft: l, offsetTop: t } = ref.current;
            setCursorVertClickedCoord({left: l, top: t});
        };
    }, [isActive, setCursorVertClickedCoord])

    return (
        <motion.li 
            className={cn(
                s.doc_category,
                monserrat_medium.className,
                isActive && s.chosen
            )}
            ref={ref}
            transition={transition}

            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href={href}
            >
                {children}
            </Link>
        </motion.li>
    )
}