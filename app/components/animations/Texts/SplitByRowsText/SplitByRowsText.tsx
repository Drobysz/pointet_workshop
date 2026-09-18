"use client";

import { Tag } from "../types";
import { useEffect, useRef } from "react";
import { animate, motion, stagger, useInView } from "framer-motion";
import SplitType from "split-type";

export const SplitByRowsText = ({
    tag,
    children,
    once=true,
    className,
}: {
    tag: Tag;
    children: string;
    once?: boolean;
    className?: string;
})=> {
    const motionTags = {
        h1: motion.h1,
        h2: motion.h2,
        h3: motion.h3,
        h4: motion.h4,
        h5: motion.h5,
        h6: motion.h6,
        p: motion.p,
        span: motion.span,
    } as const;

    const MotionTag = motionTags[tag];
    const parentRef = useRef<HTMLSpanElement | null>(null);
    const linesRef = useRef<HTMLElement[]>([]);

    const isInView = useInView(parentRef, {
        once: once,
        amount: 0.3
    })

    useEffect(()=> {
        if (!parentRef.current) return;
        const element = parentRef.current;

        let split: SplitType | null = null;
        let frameId: number | null = null;
        let prevWidth = element.getBoundingClientRect().width;

        const rebuild = ()=> {
            split?.revert()
            split = new SplitType(element, {
                types: "lines"
            })
            split.lines?.forEach(line => {
                const wrapper = document.createElement("div");

                wrapper.style.overflow = "hidden";
                line.style.transformOrigin = "left bottom";
                line.style.overflow = "hidden";
                
                line.parentNode?.insertBefore(wrapper, line);
                wrapper.appendChild(line);
            });
            linesRef.current = split.lines ?? [];
        }

        rebuild();

        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            if (Math.abs(width - prevWidth) < 1) {
                return;
            }
            prevWidth = width;
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }
            frameId = requestAnimationFrame(() => {
                rebuild();
                frameId = null;
            });
        });

        observer.observe(element);

        return ()=> {
            observer.disconnect();
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }
            split?.revert();
        }
    }, [children])

    useEffect(()=> {
        if (!isInView || !linesRef.current.length) return;

        const controls = animate(
            linesRef.current,
            {

                y: ["80%", "0%"],
                rotate: [35, 0]
            },
            {
                duration: 0.7,
                delay: stagger(0.12),
                ease: [0.16, 1, 0.3, 1],
            }
        );

        return ()=> {
            controls.stop();
        }
    }, [isInView])

    return (
        <MotionTag
            className={className}
        >
            <span
                ref={parentRef}
            >
                {children}
            </span>
        </MotionTag>
    )
}
