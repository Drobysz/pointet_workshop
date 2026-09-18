'use client';

import { createContext, useCallback, useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import { useWindowWidth } from '@/hooks';
import {
    ScrollToOptions,
    SmoothScrollContextValue,
} from "./types";
import { SrollService } from "@/helpers";
import { usePathname } from 'next/navigation';


export const SmoothScrollContext = 
createContext<SmoothScrollContextValue>({
    scrollTo: () => {},
    scrollToTop: () => {},
});

export function SmoothScrollContextProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const scrollRef = useRef<LocomotiveScroll | null>(null);
    const isDesktop = useWindowWidth(850) as boolean;
    const pathname = usePathname();

    const scrollTo = useCallback((
        target: HTMLElement,
        { block = 'start', immediate = false }: ScrollToOptions = {},
    ) => {
        if (scrollRef.current) {
            const targetHeight = target.getBoundingClientRect().height;
            const offset = SrollService.getOffset(
                block, 
                targetHeight, 
                window.innerHeight
            );

            scrollRef.current.scrollTo(target, { immediate, offset });
            return;
        }

        target.scrollIntoView({
            behavior: immediate ? 'instant' : 'smooth',
            block,
        });
    }, []);

    const scrollToTop = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo("top", { immediate: true });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, []);

    useEffect(() => {
        if (!isDesktop) {
            scrollRef.current?.destroy();
            scrollRef.current = null;
            return;
        }

        scrollRef.current = new LocomotiveScroll({
            lenisOptions: {
                duration: 1.6,
                lerp: 0.07,
                wheelMultiplier: 0.9,
                touchMultiplier: 1,
                smoothWheel: true,
                syncTouch: true,
            }
        })

        return () => {
            scrollRef.current?.destroy();
            scrollRef.current = null;
        }
    }, [isDesktop, scrollToTop]);

    useEffect(()=> {
        scrollToTop(); // Scroll to top when switching to desktop view
    }, [pathname, scrollToTop])

    return (
        <SmoothScrollContext.Provider 
            value={{ scrollTo, scrollToTop }}
        >
            {children}
        </SmoothScrollContext.Provider>
    )
}
