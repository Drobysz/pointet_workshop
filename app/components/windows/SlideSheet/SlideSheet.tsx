"use client";

import { AnimatePresence, motion, Transition } from "framer-motion";
import {
    KeyboardEvent,
    useEffect,
    useRef,
    useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/helpers";
import { useDismiss, useScrollLock } from "@/hooks";
import { SlideSheetProps } from "./SlideSheet.props";
import s from "./style.module.scss";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

const transition: Transition = {
    duration: 0.45,
    ease: [0.33, 1, 0.68, 1],
};

const subscribeToNothing = ()=> ()=> {};

/**
 * Modal sheet sliding in from the top or the bottom edge of the screen.
 * Rendered in a portal, because ancestors with `backdrop-filter` or
 * `transform` (the site header) would otherwise capture `position: fixed`.
 */
export const SlideSheet = ({
    isOpen,
    onClose,
    label,
    side = "bottom",
    id,
    className,
    triggerRef,
    children,
}: SlideSheetProps)=> {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const isMounted = useSyncExternalStore(
        subscribeToNothing,
        ()=> true,
        ()=> false,
    );

    useScrollLock(isOpen);
    useDismiss({
        isOpen,
        refs: triggerRef ? [panelRef, triggerRef] : [panelRef],
        onDismiss: onClose,
    });

    // Move focus into the sheet and hand it back once the sheet closes.
    useEffect(()=> {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;

        panelRef.current?.focus();

        return ()=> {
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    // Keep keyboard focus inside the sheet while it is open.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>)=> {
        if (event.key !== "Tab" || !panelRef.current) return;

        const focusable = panelRef.current
            .querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || active === panelRef.current)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };

    if (!isMounted) return null;

    const hiddenOffset = side === "top" ? "-100%" : "100%";

    return createPortal(
        <AnimatePresence>
            {isOpen &&
                <motion.div
                    key="slide-sheet-overlay"
                    className={cn(s.overlay, s[`overlay_${side}`])}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                    aria-hidden="true"
                />
            }
            {isOpen &&
                <motion.div
                    key="slide-sheet-panel"
                    ref={panelRef}
                    id={id}
                    className={cn(s.panel, s[`panel_${side}`], className)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={label}
                    tabIndex={-1}
                    initial={{ y: hiddenOffset }}
                    animate={{ y: 0 }}
                    exit={{ y: hiddenOffset }}
                    transition={transition}
                    onKeyDown={handleKeyDown}
                >
                    {children}
                </motion.div>
            }
        </AnimatePresence>,
        document.body
    );
};
