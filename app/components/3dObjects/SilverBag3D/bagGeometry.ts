import { clamp, length2, polygonize, smax, smoothstep } from "../shared/sdf";

/**
 * 2D distance to the convex hull of two vertically stacked circles (an "egg"):
 * radius `r1` centred at (0, y1) below, radius `r2` centred `h` above it.
 */
function egg(x: number, y: number, y1: number, r1: number, r2: number, h: number) {
    const px = Math.abs(x);
    const py = y - y1;
    const b = (r1 - r2) / h;
    const a = Math.sqrt(1 - b * b);
    const k = -b * px + a * py;
    if (k < 0) return length2(px, py) - r1;
    if (k > a * h) return length2(px, py - h) - r2;
    return a * px + b * py - r1;
}

/**
 * Elliptical rounding of a 2D region: zero thickness at its edge, rising over `reach`
 * to a half-depth of `depth`. Smooth everywhere, so mirror reflections stay unbroken.
 */
function dome(distance: number, z: number, reach: number, depth: number) {
    const inward = 1 - Math.min(-distance / reach, 1);
    return (length2(z / depth, inward) - 1) * depth;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Liquid-metal hobo bag, seen front-on: one inverted-egg silhouette whose sides rise
 * continuously into the handle, pierced by an egg-shaped opening. The outer edge gives
 * a full pebble dome; the opening gets its own tight rounding, so the mouth is a
 * compact rounded lip and the arms become a narrow, deep band.
 */
function bagField(x: number, y: number, z: number) {
    // A faint organic lean, so it reads as cast rather than turned.
    const sx = x + 0.025 * Math.sin(y * 1.7 + 0.4);
    // A broader, flatter base: the lower curve is an ellipse rather than a half circle.
    const sy = y < -0.5 ? -0.5 + (y + 0.5) / 0.82 : y;
    const outer = egg(sx, sy, -0.5, 1.0, 0.66, 1.34);
    const opening = egg(sx, y, 0.58, 0.55, 0.26, 0.54);
    // 0 in the body, 1 in the handle; the arms broaden into the body around the mouth.
    const handle = smoothstep(-0.15, 0.6, y);
    const shell = dome(outer, z, lerp(1.0, 0.1, handle), lerp(0.5, 0.16, handle));
    const lip = dome(-opening, z, lerp(0.24, 0.1, handle), lerp(0.62, 0.16, handle));
    // Hand-polished metal is never perfectly true: a faint, low-frequency undulation
    // makes reflections ripple organically instead of sliding like a CG primitive.
    const ripple = 0.007 * (Math.sin(2.3 * x + 1.1 * y + 0.7) * Math.sin(1.9 * y - 1.4 * z)
        + 0.6 * Math.sin(3.7 * y + 0.8 * x - 1.2) * Math.cos(2.9 * z + 0.5 * x));
    return smax(shell, lip, 0.04) + ripple;
}

export function createBagGeometry() {
    // The field is non-Euclidean in z; clamp guards the projection against huge steps.
    const field = (x: number, y: number, z: number) => clamp(bagField(x, y, z), -2, 2);
    return { body: polygonize(field, [-1.15, -1.6, -0.6], [1.15, 1.6, 0.6], 0.032) };
}
