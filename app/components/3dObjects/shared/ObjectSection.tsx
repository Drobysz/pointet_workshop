"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { cn } from "@/helpers/cn";
import type { Object3DProps, ObjectKind } from "./types";
import { modelLoaders } from "./modelLoaders";
import { preloadGeometry } from "./geometryData";
import s from "./ObjectSection.module.scss";

const ObjectScene = dynamic(() => import("./InteractiveObjectScene"), { ssr: false });
const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
    const media = window.matchMedia(motionQuery);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
}

class SceneBoundary extends Component<
    { children: ReactNode; fallback: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

export function ObjectSection({
    kind,
    id,
    className,
    style,
    label,
    instructions = "Drag to rotate. On touch screens, swipe sideways to rotate or vertically to scroll. Use arrow keys to rotate and Home to reset.",
    fallbackText = "The interactive 3D view is unavailable on this device.",
    idleMotion = false,
}: Object3DProps & { kind: ObjectKind }) {
    const sectionRef = useRef<HTMLElement>(null);
    const instructionsId = useId();
    const [nearby, setNearby] = useState(false);
    const [visible, setVisible] = useState(false);
    const [pageVisible, setPageVisible] = useState(true);
    const reducedMotion = useSyncExternalStore(
        subscribeMotion,
        () => window.matchMedia(motionQuery).matches,
        () => true,
    );

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        // Warm code and geometry during idle time, even far below the fold.
        // WebGL contexts still mount only as their sections approach.
        const warm = () => {
            void import("./InteractiveObjectScene").catch(() => {});
            void modelLoaders[kind]().catch(() => {});
            void preloadGeometry(kind);
        };
        const idle = window.requestIdleCallback?.(warm, { timeout: 2000 });
        const timer = idle === undefined ? window.setTimeout(warm, 300) : undefined;

        const preload = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                // Fetch the model in parallel with the dynamic scene import.
                // Rendering retries failures through the existing error boundary.
                void modelLoaders[kind]().catch(() => {});
                void preloadGeometry(kind);
                setNearby(true);
                preload.disconnect();
            }
        }, { rootMargin: `${Math.max(1200, window.innerHeight * 2)}px` });
        const visibility = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
        });
        const onVisibility = () => setPageVisible(!document.hidden);
        preload.observe(section);
        visibility.observe(section);
        onVisibility();
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            if (idle !== undefined) window.cancelIdleCallback(idle);
            if (timer !== undefined) window.clearTimeout(timer);
            preload.disconnect();
            visibility.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [kind]);

    const fallback = <p className={s.fallback} role="status">{fallbackText}</p>;

    return (
        <section
            ref={sectionRef}
            id={id}
            className={cn("w-full h-screen", s.section, className)}
            style={style}
            tabIndex={0}
            role="group"
            aria-label={label}
            aria-describedby={instructionsId}
        >
            <span id={instructionsId} className={s.instructions}>{instructions}</span>
            <SceneBoundary fallback={fallback}>
                {nearby && (
                    <ObjectScene
                        kind={kind}
                        sectionRef={sectionRef}
                        active={visible && pageVisible}
                        reducedMotion={reducedMotion}
                        idleMotion={idleMotion}
                        fallbackText={fallbackText}
                    />
                )}
            </SceneBoundary>
        </section>
    );
}
