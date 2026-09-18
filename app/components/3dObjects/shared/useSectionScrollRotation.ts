import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { sectionScrollRotation } from "./rotationMath";

export function useSectionScrollRotation(
    sectionRef: RefObject<HTMLElement | null>,
    active: boolean,
    reducedMotion: boolean,
    invalidate: () => void,
) {
    const rotation = useRef({ rotationX: 0, rotationY: 0 });

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const rect = section.getBoundingClientRect();
            rotation.current = reducedMotion
                ? { rotationX: 0, rotationY: 0 }
                : sectionScrollRotation(rect.top, rect.height, window.innerHeight);
            invalidate();
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        if (!active || reducedMotion) return;
        // Capture also catches scrolling in nested scroll containers.
        window.addEventListener("scroll", schedule, { passive: true, capture: true });
        window.addEventListener("resize", schedule, { passive: true });
        const resize = new ResizeObserver(schedule);
        resize.observe(section);
        return () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            window.removeEventListener("scroll", schedule, true);
            window.removeEventListener("resize", schedule);
        };
    }, [sectionRef, active, reducedMotion, invalidate]);

    return rotation;
}
