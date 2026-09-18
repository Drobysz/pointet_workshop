"use client";

import { useId, useState } from "react";
import { type HTMLMotionProps } from "framer-motion";
import { cn } from "@/helpers";
import { SplitTextProps } from "./SplitText.props";
import { Tag } from "../types";
import { motionTags } from "./motionTags";
import type { ComponentType, CSSProperties } from "react";
import s from "./style.module.scss";

export const SplitText = <T extends Tag>({
    tag,
    children,
    className,
    animationType = "blurred",
    viewportAmount = 0.3,
    delayChildren,
    once=true,
    ...props
}: SplitTextProps<T>)=> {
    const words = children.split(" ");
    const MotionTag = motionTags[tag] as ComponentType<
        Omit<HTMLMotionProps<T>, "ref">
    >;
    const motionProps = props as Omit<HTMLMotionProps<T>, "ref">;
    const tagId = useId();
    const [visible, setVisible] = useState(false);

    const animVariants = {
        "unwrapping": s.unwrapping,
        "blurred": s.blurred,
    }

    const currentAnim = animVariants[animationType];

    return (
        <MotionTag
            {...motionProps}
            className={cn(
                className, 
                s.text,
                currentAnim,
                visible && s.visible,
            )}
             onViewportEnter={() => setVisible(true)}
            viewport={{
                once: once,
                amount: viewportAmount,
            }}
        >
            {words.map((w, wId)=> 
                <span
                    key={`${tagId}_w_${wId}`}
                    className={s.word}
                >
                    {w.split("").map((c, cId)=>
                            <span
                                key={`${tagId}_${wId}_c_${cId}`}
                                className={s.char}
                                style={{
                                    "--char-delay": `${(
                                        (delayChildren ?? 0) +
                                        wId * 0.23 +
                                        cId * 0.03
                                    )}s`,
                                } as CSSProperties}
                            >
                                {(c === " " ? "\u00A0" : c)}
                            </span>
                    )}
                    <span>&nbsp;</span>
                </span>
            )}
        </MotionTag>
    )
}
