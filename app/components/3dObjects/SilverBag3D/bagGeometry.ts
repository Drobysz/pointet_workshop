import { clamp, ellipse2d, length2, polygonize, smax, smin } from "../shared/sdf";

/**
 * One continuous liquid-metal surface: a soft pillow body that tapers and pinches toward a
 * closed top ridge, fused with a tall oval handle through a wide smooth fillet.
 */
function bagField(x: number, y: number, z: number) {
    // Body: rounded super-ellipse silhouette, narrower and thinner toward the top.
    const t = clamp((y + 0.95) / 1.9, 0, 1);
    const xs = x / (1 - 0.2 * t);
    const zs = z / (1 - 0.58 * t * t);
    const p = 2.6;
    const silhouette = Math.pow(Math.pow(Math.abs(xs) / 1.35, p) + Math.pow(Math.abs(y) / 0.95, p), 1 / p);
    let body = (length2(silhouette, zs / 0.62) - 1) * 0.62;
    // A soft flat base so the bag reads as standing, not floating as a pebble.
    body = smax(body, -(y + 0.84), 0.2);

    // Handle: tall oval loop with a slightly flattened, strap-like cross-section.
    const centre = ellipse2d(x, y - 0.86, 0.66, 0.92);
    const handle = (length2(centre / 0.115, z / 0.15) - 1) * 0.115;

    return smin(body, handle, 0.32);
}

export function createBagGeometry() {
    return { body: polygonize(bagField, [-1.5, -1.0, -0.75], [1.5, 2.05, 0.75], 0.04) };
}
