"use client";

import { useContext, useState } from 'react';
import s from './styles.module.scss';
import { ChevronUp } from "lucide-react";
import { 
    SmoothScrollContext 
} from '@/app/[locale]/(home)/smooth_scroll_context/SmoothScroll';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from "@/helpers/cn";

export const ScrollToTopBtn = () => {
    const { scrollToTop } = useContext(SmoothScrollContext);
    const [isVisible, setIsVisible] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    });

    return (
        <button
            type="button"
            className={cn(
                s.scrollTopBtn, {
                    ["translate-y-1 hover:translate-y-0"]: isVisible,
                    ["translate-y-full"]: !isVisible,
                },
            )}
            onClick={scrollToTop}
        >
            <ChevronUp 
                className="text-white"
            />
        </button>
    )
}
