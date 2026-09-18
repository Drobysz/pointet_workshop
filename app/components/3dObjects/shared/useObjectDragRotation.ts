import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { clamp, MAX_TILT } from "./rotationMath";

export function useObjectDragRotation(
    sectionRef: RefObject<HTMLElement | null>,
    invalidate: () => void,
) {
    const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, dragging: false, interacted: false });

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        let pointer: number | null = null;
        let lastX = 0;
        let lastY = 0;
        let startX = 0;
        let startY = 0;
        let lastTime = 0;
        let pendingTouch = false;

        const finish = (cancelled: boolean) => {
            if (pointer === null) return;
            const captured = pointer;
            pointer = null;
            motion.current.dragging = false;
            if (cancelled || performance.now() - lastTime > 100) {
                motion.current.vx = 0;
                motion.current.vy = 0;
            }
            delete section.dataset.dragging;
            if (section.hasPointerCapture(captured)) section.releasePointerCapture(captured);
            invalidate();
        };

        const down = (event: PointerEvent) => {
            if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
            pointer = event.pointerId;
            startX = lastX = event.clientX;
            startY = lastY = event.clientY;
            lastTime = performance.now();
            pendingTouch = event.pointerType === "touch";
            motion.current.vx = motion.current.vy = 0;
            motion.current.interacted = true;
            if (!pendingTouch) {
                motion.current.dragging = true;
                section.dataset.dragging = "true";
                section.setPointerCapture(pointer);
            }
            invalidate();
        };

        const move = (event: PointerEvent) => {
            if (event.pointerId !== pointer) return;
            if (pendingTouch) {
                const dx = Math.abs(event.clientX - startX);
                const dy = Math.abs(event.clientY - startY);
                if (Math.max(dx, dy) < 7) return;
                // Leave vertical gestures to the browser, including its momentum scrolling.
                if (dy > dx) {
                    finish(true);
                    return;
                }
                pendingTouch = false;
                motion.current.dragging = true;
                section.dataset.dragging = "true";
                section.setPointerCapture(event.pointerId);
            }
            const now = performance.now();
            const elapsed = Math.max((now - lastTime) / 1000, 1 / 120);
            const sensitivity = 2.6 / Math.max(320, Math.min(section.clientWidth, section.clientHeight));
            const dx = (event.clientX - lastX) * sensitivity;
            const dy = (event.clientY - lastY) * sensitivity;
            const state = motion.current;
            state.x = clamp(state.x + dy, -MAX_TILT, MAX_TILT);
            state.y += dx;
            state.vx = clamp(dy / elapsed, -1.8, 1.8);
            state.vy = clamp(dx / elapsed, -2.5, 2.5);
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            invalidate();
        };

        const up = (event: PointerEvent) => {
            if (event.pointerId === pointer) finish(false);
        };
        const cancel = (event: PointerEvent) => {
            if (event.pointerId === pointer) finish(true);
        };
        const blur = () => finish(true);
        const keydown = (event: KeyboardEvent) => {
            if (event.target !== section) return;
            const state = motion.current;
            switch (event.key) {
                case "ArrowLeft": state.y -= 0.14; break;
                case "ArrowRight": state.y += 0.14; break;
                case "ArrowUp": state.x = clamp(state.x - 0.1, -MAX_TILT, MAX_TILT); break;
                case "ArrowDown": state.x = clamp(state.x + 0.1, -MAX_TILT, MAX_TILT); break;
                case "Home": state.x = state.y = 0; break;
                default: return;
            }
            event.preventDefault();
            state.vx = state.vy = 0;
            state.interacted = true;
            invalidate();
        };

        section.addEventListener("pointerdown", down);
        section.addEventListener("pointermove", move);
        section.addEventListener("pointerup", up);
        section.addEventListener("pointercancel", cancel);
        section.addEventListener("lostpointercapture", cancel);
        section.addEventListener("keydown", keydown);
        window.addEventListener("blur", blur);
        return () => {
            finish(true);
            section.removeEventListener("pointerdown", down);
            section.removeEventListener("pointermove", move);
            section.removeEventListener("pointerup", up);
            section.removeEventListener("pointercancel", cancel);
            section.removeEventListener("lostpointercapture", cancel);
            section.removeEventListener("keydown", keydown);
            window.removeEventListener("blur", blur);
        };
    }, [sectionRef, invalidate]);

    return motion;
}
