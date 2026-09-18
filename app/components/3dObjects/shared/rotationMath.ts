export const MAX_TILT = 0.48;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Rotate around the centered pivot as this section enters and leaves the viewport. */
export function sectionScrollRotation(top: number, height: number, viewportHeight: number) {
    const progress = clamp((viewportHeight - top) / (viewportHeight + height), 0, 1);
    const direction = progress * 2 - 1;

    return {
        rotationX: direction * 0.3,
        rotationY: direction * 0.45,
    };
}

/** Frame-rate-independent inertia, including the exact integrated displacement. */
export function inertiaStep(velocity: number, delta: number) {
    const decay = Math.exp(-7 * delta);
    return { distance: velocity * (1 - decay) / 7, velocity: velocity * decay };
}
