import { CatmullRomCurve3, LatheGeometry, SplineCurve, TorusGeometry, TubeGeometry, Vector2, Vector3 } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { mergeParts } from "../shared/geometry";
import { extrude, flipWinding, length2, parametric, polygonize, smax, smoothstep } from "../shared/sdf";

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

/** Hand-thrown ceramic vase: swollen belly, narrow neck, flared lip and an open mouth. */
function createVase() {
    const outline = new SplineCurve([
        [0, -1], [0.27, -1], [0.305, -0.975], [0.3, -0.92], [0.38, -0.74],
        [0.53, -0.46], [0.62, -0.16], [0.625, 0.04], [0.57, 0.3], [0.44, 0.54],
        [0.29, 0.73], [0.2, 0.87], [0.185, 0.97], [0.215, 1.06], [0.285, 1.13], [0.305, 1.155],
        [0.29, 1.17], [0.262, 1.15], [0.2, 1.08], [0.162, 0.98], [0.16, 0.86], [0, 0.82],
    ].map(([x, y]) => new Vector2(x, y))).getSpacedPoints(72);
    outline[0].x = 0;
    outline[outline.length - 1].x = 0;
    const lathe = new LatheGeometry(outline, 96);
    lathe.deleteAttribute("normal");
    lathe.deleteAttribute("uv");
    const vase = mergeVertices(lathe, 1e-5);
    lathe.dispose();
    const position = vase.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        const angle = Math.atan2(x, z);
        // Fourteen soft flutes on the belly, fading out at foot and shoulder.
        const fluting = smoothstep(-0.85, -0.55, y) * (1 - smoothstep(0.25, 0.62, y));
        const flute = 1 - 0.04 * fluting * Math.pow(Math.sin(angle * 7), 2);
        // Slight asymmetry so it reads as made by hand, not turned by machine.
        const wobble = 1 + 0.018 * Math.sin(angle * 2 + y * 2.4) * smoothstep(-1, -0.6, y);
        position.setXYZ(i, x * flute * wobble, y, z * flute * wobble);
    }
    vase.computeVertexNormals();
    return vase;
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
    const vase = createVase();
    const bracelet = createBangle();
    return { ...bag, vase, bracelet };
}
