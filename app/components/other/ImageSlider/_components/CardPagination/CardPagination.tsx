"use client";

import { motion } from "framer-motion";
import s from "./style.module.scss";
import cn from "classnames";
import { useWindowWidth } from "@/hooks";
import { MouseEvent } from "react";

export const CardPagination = ({
    imgIdx,
    setImgIdx,
    hover,
    qntty
}: {
    imgIdx: number;
    setImgIdx: (idx: number) => void;
    hover: boolean;
    qntty: number;
})=> {
    const isDesktop = useWindowWidth(768) as boolean;
    const isVisible = !isDesktop || hover;

    const handleClick = (
            e: MouseEvent<HTMLLIElement>,
            idx: number
        )=> {
            e.stopPropagation();
            e.preventDefault();
    
            setImgIdx(idx);
        };

    return (
        <motion.ul
            className={s.bounds}
            animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : -5,
                transition: { duration: 0.2, ease: "easeInOut" }
            }}
        >
            {Array(qntty).fill(true).map((_, i)=> (
                <li
                    className={cn(
                        imgIdx === i && s.active,
                        s.point
                    )}
                    onClick={(e)=> handleClick(e, i)}
                    key={`card-pag-${i}`}
                />
            ))}
        </motion.ul>
    )
}