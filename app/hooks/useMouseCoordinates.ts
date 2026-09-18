import { useEffect, useState } from "react";

export const useMouseCoordinates = (isActive: boolean) => {
    const [mousePosition, setMousePosition] = useState<{x: number , y: number}>({ x: 0, y: 0 });

    useEffect(() => {
        if (!isActive) return;

        let animationFrame: number | null = null;

        const handleMouseMove = (e: PointerEvent) => {
            const nextPosition = { x: e.clientX, y: e.clientY };

            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }

            animationFrame = window.requestAnimationFrame(() => {
                setMousePosition(nextPosition);
                animationFrame = null;
            });
        };

        window.addEventListener("pointermove", handleMouseMove, { passive: true });

        return () => {
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }

            window.removeEventListener("pointermove", handleMouseMove);
        };
    }, [isActive]);

    return {
        x: mousePosition.x,
        y: mousePosition.y,
    }
}
