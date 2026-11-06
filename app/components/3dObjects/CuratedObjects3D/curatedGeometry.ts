import { CatmullRomCurve3, TorusGeometry, TubeGeometry, Vector3 } from "three";
import { mergeParts } from "../shared/geometry";
import { extrude, flipWinding, keyframes, length2, parametric, polygonize, smax, smoothstep } from "../shared/sdf";
import type { Vec3 } from "../shared/sdf";

/** Structured half-moon bag body: a puffed, rounded D-shape with a flat top edge. */
function halfMoonField(x: number, y: number, z: number) {
    const outline = smax(length2(x, y - 0.22) - 0.78, y - 0.22, 0.14);
    // Puffed centre, thinner rolled edges.
    const depth = 0.12 + 0.13 * smoothstep(0, -0.55, outline);
    return extrude(outline, z, depth, 0.085);
}

function createHalfMoonBag() {
    const body = polygonize(halfMoonField, [-0.92, -0.66, -0.4], [0.92, 0.36, 0.4], 0.032);

    // Arched gold top handle; its ends sink into the rolled top edge.
    const arc = [];
    for (let i = 0; i <= 24; i++) {
        const angle = Math.PI * (0.02 + 0.96 * i / 24);
        arc.push(new Vector3(Math.cos(angle) * 0.46, 0.12 + Math.sin(angle) * 0.55, 0));
    }
    const handle = new TubeGeometry(new CatmullRomCurve3(arc), 48, 0.034, 8, false);
    // Turn-lock clasp on the front face.
    const clasp = new TorusGeometry(0.072, 0.02, 10, 40);
    clasp.translate(0, -0.05, 0.196);
    const plate = new TorusGeometry(0.03, 0.022, 8, 24);
    plate.translate(0, -0.05, 0.2);
    return { bagBody: body, bagGold: mergeParts([handle, clasp, plate]) };
}

// ---- Corset -------------------------------------------------------------------------

// Height → elliptical cross-section radii [x, z]: hip flare, cinched waist, ribcage, bust.
const corsetSilhouette = keyframes([
    [-1.05, 0.56, 0.4],
    [-0.72, 0.47, 0.335],
    [-0.3, 0.375, 0.27],
    [0.15, 0.49, 0.345],
    [0.55, 0.6, 0.44],
    [0.95, 0.56, 0.38],
]);
const PANELS = 14;
const CORSET_SEGMENTS = PANELS * 9; // Every seam falls exactly on a vertex column.
const gauss = (x: number, width: number) => Math.exp(-((x / width) ** 2));
const corsetTheta = (u: number) => (u - 0.5) * Math.PI * 2;

function corsetTop(theta: number) {
    const a = Math.abs(theta);
    // Sweetheart neckline: two cup peaks, a dip at centre front, lower at the back.
    return 0.78 + 0.16 * gauss(a - 0.5, 0.35) - 0.12 * gauss(theta, 0.14) - 0.1 * smoothstep(1.4, Math.PI, a);
}

function corsetBottom(theta: number) {
    // Pointed basque at centre front, curving up over the hips.
    return -0.92 - 0.13 * gauss(theta, 0.34) + 0.13 * gauss(Math.abs(theta) - Math.PI / 2, 0.5);
}

function corsetPoint(theta: number, y: number, inflate = 1): Vec3 {
    const [rx, rz] = corsetSilhouette(y);
    // Each panel puffs slightly between boned seams, which crease inward.
    const phase = (theta / (Math.PI * 2)) * PANELS;
    const f = phase - Math.floor(phase);
    let radius = 1 + 0.034 * Math.sqrt(4 * f * (1 - f));
    radius *= 1 + 0.07 * gauss(y - 0.55, 0.2) * (gauss(theta - 0.5, 0.33) + gauss(theta + 0.5, 0.33));
    radius *= inflate;
    return [rx * Math.sin(theta) * radius, y, rz * Math.cos(theta) * radius];
}

function closedEdge(edge: (theta: number) => number, radius: number) {
    const points = [];
    for (let i = 0; i < 140; i++) {
        const theta = corsetTheta(i / 140);
        points.push(new Vector3(...corsetPoint(theta, edge(theta))));
    }
    return new TubeGeometry(new CatmullRomCurve3(points, true), 160, radius, 5, true);
}

/** White satin bustier: boned panels, sweetheart neckline, basque point, laced back. */
function createCorset() {
    const body = parametric((u, v) => {
        const theta = corsetTheta(u);
        const top = corsetTop(theta);
        return corsetPoint(theta, top + (corsetBottom(theta) - top) * v);
    }, CORSET_SEGMENTS, 46, { wrapU: true });

    const parts = [body, closedEdge(corsetTop, 0.017), closedEdge(corsetBottom, 0.017)];
    // Boning channels: a fine raised cord down every seam (wider busk at centre front).
    for (let seam = 0; seam < PANELS; seam++) {
        const theta = -Math.PI + seam * (Math.PI * 2) / PANELS;
        const top = corsetTop(theta) - 0.012;
        const bottom = corsetBottom(theta) + 0.012;
        const points = [];
        for (let i = 0; i <= 16; i++) points.push(new Vector3(...corsetPoint(theta, top + (bottom - top) * i / 16, 1.004)));
        parts.push(new TubeGeometry(new CatmullRomCurve3(points), 24, seam === PANELS / 2 ? 0.014 : 0.0085, 4, false));
    }
    // Back lacing: eyelets either side of centre back, crossed by a continuous lace.
    const eyelets: Vector3[][] = [[], []];
    for (let row = 0; row < 7; row++) {
        const y = 0.55 - row * 0.21;
        for (const [index, side] of [[0, -1], [1, 1]] as const) {
            const theta = Math.PI - side * 0.13;
            const [x, , z] = corsetPoint(theta, y, 1.012);
            const eyelet = new TorusGeometry(0.022, 0.008, 6, 16);
            eyelet.lookAt(new Vector3(x, 0, z));
            eyelet.translate(x, y, z);
            parts.push(eyelet);
            eyelets[index].push(new Vector3(x, y, z));
        }
    }
    for (let row = 0; row < 6; row++) {
        for (const [from, to] of [[eyelets[0][row], eyelets[1][row + 1]], [eyelets[1][row], eyelets[0][row + 1]]]) {
            const middle = from.clone().lerp(to, 0.5).multiplyScalar(1.03);
            middle.y = (from.y + to.y) / 2;
            parts.push(new TubeGeometry(new CatmullRomCurve3([from, middle, to]), 10, 0.009, 5, false));
        }
    }
    return mergeParts(parts);
}

/** Chunky three-strand twisted gold bangle. */
function createBangle() {
    const major = 0.5;
    const bangle = parametric((u, v) => {
        const around = u * Math.PI * 2;
        const tube = v * Math.PI * 2;
        const radius = 0.105 * (0.9 + 0.12 * Math.cos(3 * tube + 21 * around));
        const ring = major + radius * Math.cos(tube);
        return [Math.cos(around) * ring, Math.sin(tube) * radius, Math.sin(around) * ring];
    }, 168, 20, { wrapU: true, wrapV: true });
    // A torus has no single "outside" point; orient against the tube centreline instead.
    const position = bangle.getAttribute("position");
    const normal = bangle.getAttribute("normal");
    let score = 0;
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), z = position.getZ(i);
        const r = length2(x, z) || 1;
        score += (x - x / r * major) * normal.getX(i) + position.getY(i) * normal.getY(i) + (z - z / r * major) * normal.getZ(i);
    }
    return score >= 0 ? bangle : flipWinding(bangle);
}

export function createCuratedGeometry() {
    const bag = createHalfMoonBag();
    const corset = createCorset();
    const bracelet = createBangle();
    return { ...bag, corset, bracelet };
}
