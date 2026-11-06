import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { mergeParts } from "../shared/geometry";
import { keyframes, parametric, smoothstep } from "../shared/sdf";
import type { Vec3 } from "../shared/sdf";

/**
 * Slip gown on an invisible form: sweetheart corset bodice, cinched waist, and a bias-cut
 * skirt that flares into deep rolling folds, with a high-low hem and a short back train.
 * θ = 0 faces the camera (+Z).
 */

// Height → elliptical cross-section radii [x, z] of the underlying silhouette.
const silhouette = keyframes([
    [-1.8, 1.32, 1.08],
    [-1.15, 1.05, 0.85],
    [-0.55, 0.77, 0.61],
    [0.05, 0.51, 0.375],
    [0.38, 0.4, 0.295],
    [0.72, 0.302, 0.214],
    [1.02, 0.365, 0.258],
    [1.3, 0.435, 0.305],
    [1.62, 0.39, 0.262],
]);

const gauss = (x: number, width: number) => Math.exp(-((x / width) ** 2));

/** Normalised fold pattern: broad godets with secondary ripples that drift as they fall. */
function folds(theta: number, y: number) {
    return (Math.sin(9 * theta + 0.55 * y) + 0.35 * Math.sin(16 * theta + 1.3 + 0.9 * y)) / 1.35;
}

function neckline(theta: number) {
    const a = Math.abs(theta);
    return 1.46 + 0.15 * gauss(a - 0.45, 0.32) - 0.11 * gauss(theta, 0.13) - 0.06 * smoothstep(1.6, Math.PI, a);
}

function hemline(theta: number) {
    // Higher at the front, falling to a short train; fold crests lift the edge slightly.
    return -1.8 + 0.24 * (1 + Math.cos(theta)) / 2 + 0.05 * folds(theta, -1.7);
}

function surface(theta: number, y: number, inflate = 1): Vec3 {
    const [rx, rz] = silhouette(y);
    const skirt = smoothstep(0.15, -1.8, y);
    let radius = 1 + 0.12 * Math.pow(skirt, 1.2) * folds(theta, y);
    // Gentle bust shaping and a fuller back skirt for the train.
    radius *= 1 + 0.06 * gauss(y - 1.3, 0.17) * (gauss(theta - 0.45, 0.32) + gauss(theta + 0.45, 0.32));
    const train = 1 + 0.16 * smoothstep(-0.2, -1.8, y) * Math.max(0, -Math.cos(theta));
    radius *= inflate;
    return [rx * Math.sin(theta) * radius, y, rz * Math.cos(theta) * radius * train];
}

const thetaAt = (u: number) => (u - 0.5) * Math.PI * 2;

function closedTrim(pointAt: (theta: number) => Vec3, radius: number) {
    const points = [];
    for (let i = 0; i < 160; i++) points.push(new Vector3(...pointAt(thetaAt(i / 160))));
    return new TubeGeometry(new CatmullRomCurve3(points, true), 200, radius, 5, true);
}

function strap(side: 1 | -1) {
    const front = neckline(0.45) - 0.025;
    const back = neckline(2.55) - 0.025;
    const points: Vec3[] = [
        surface(side * 0.45, front, 0.985),
        [side * 0.2, 1.93, 0.17],
        [side * 0.225, 2.13, 0],
        [side * 0.235, 1.93, -0.17],
        surface(side * 2.55, back, 0.985),
    ];
    return new TubeGeometry(new CatmullRomCurve3(points.map((point) => new Vector3(...point))), 36, 0.017, 5, false);
}

export function createDressGeometry() {
    const fabric = parametric((u, v) => {
        const theta = thetaAt(u);
        const top = neckline(theta);
        return surface(theta, top + (hemline(theta) - top) * v);
    }, 126, 76, { wrapU: true });

    const trims = [
        closedTrim((theta) => surface(theta, neckline(theta)), 0.016),
        closedTrim((theta) => surface(theta, hemline(theta)), 0.017),
        // Fine piping marks the corset waist seam.
        closedTrim((theta) => surface(theta, 0.74, 1.006), 0.011),
        strap(1),
        strap(-1),
    ];
    return { fabric: mergeParts([fabric, ...trims]) };
}
