import { BufferAttribute, BufferGeometry, Vector3 } from "three";

/** Build-time modelling helpers. Excluded from the browser import graph. */

export type Vec3 = [x: number, y: number, z: number];
export type Field = (x: number, y: number, z: number) => number;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
};
export const length2 = (x: number, y: number) => Math.sqrt(x * x + y * y);
export const length3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);

/** Polynomial smooth minimum: a soft fillet of width `k` where two surfaces meet. */
export function smin(a: number, b: number, k: number) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
}
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

/** Rounded extrusion of a 2D distance along Z, with half-depth `depth` and edge radius `radius`. */
export function extrude(distance2d: number, z: number, depth: number, radius: number) {
    const wx = distance2d + radius;
    const wy = Math.abs(z) - depth + radius;
    return Math.min(Math.max(wx, wy), 0) + length2(Math.max(wx, 0), Math.max(wy, 0)) - radius;
}

/** Approximate distance to an axis-aligned ellipse (Quilez), positive outside. */
export function ellipse2d(x: number, y: number, a: number, b: number) {
    const k0 = length2(x / a, y / b);
    const k1 = length2(x / (a * a), y / (b * b));
    return k1 === 0 ? -Math.min(a, b) : k0 * (k0 - 1) / k1;
}

/**
 * Polygonize the zero level set of a field with surface nets. Vertices are projected onto
 * the surface with Newton steps, normals are the field gradient (smooth, independent of
 * tessellation), and every triangle is oriented to face along that gradient.
 */
export function polygonize(field: Field, min: Vec3, max: Vec3, cell: number) {
    const [nx, ny, nz] = [0, 1, 2].map((axis) => Math.ceil((max[axis] - min[axis]) / cell) + 1);
    const values = new Float32Array(nx * ny * nz);
    const point = (i: number, j: number, k: number) => i + nx * (j + ny * k);
    for (let k = 0; k < nz; k++) {
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                values[point(i, j, k)] = field(min[0] + i * cell, min[1] + j * cell, min[2] + k * cell);
            }
        }
    }

    const cellCount = (nx - 1) * (ny - 1) * (nz - 1);
    const cellVertex = new Int32Array(cellCount).fill(-1);
    const cellIndex = (i: number, j: number, k: number) => i + (nx - 1) * (j + (ny - 1) * k);
    const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
    const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const positions: number[] = [];
    const sample = new Float32Array(8);

    for (let k = 0; k < nz - 1; k++) {
        for (let j = 0; j < ny - 1; j++) {
            for (let i = 0; i < nx - 1; i++) {
                let inside = 0;
                for (let c = 0; c < 8; c++) {
                    sample[c] = values[point(i + corners[c][0], j + corners[c][1], k + corners[c][2])];
                    if (sample[c] < 0) inside++;
                }
                if (inside === 0 || inside === 8) continue;
                let sx = 0, sy = 0, sz = 0, crossings = 0;
                for (const [a, b] of edges) {
                    if ((sample[a] < 0) === (sample[b] < 0)) continue;
                    const t = sample[a] / (sample[a] - sample[b]);
                    sx += corners[a][0] + (corners[b][0] - corners[a][0]) * t;
                    sy += corners[a][1] + (corners[b][1] - corners[a][1]) * t;
                    sz += corners[a][2] + (corners[b][2] - corners[a][2]) * t;
                    crossings++;
                }
                cellVertex[cellIndex(i, j, k)] = positions.length / 3;
                positions.push(
                    min[0] + (i + sx / crossings) * cell,
                    min[1] + (j + sy / crossings) * cell,
                    min[2] + (k + sz / crossings) * cell,
                );
            }
        }
    }

    // Project each vertex onto the true surface; the field is smooth even where cells are coarse.
    const h = cell * 0.05;
    const gradient = (x: number, y: number, z: number, out: Vector3) => out.set(
        field(x + h, y, z) - field(x - h, y, z),
        field(x, y + h, z) - field(x, y - h, z),
        field(x, y, z + h) - field(x, y, z - h),
    ).divideScalar(2 * h);
    const g = new Vector3();
    const normals = new Float32Array(positions.length);
    for (let v = 0; v < positions.length; v += 3) {
        const ox = positions[v], oy = positions[v + 1], oz = positions[v + 2];
        let x = ox, y = oy, z = oz;
        for (let step = 0; step < 6; step++) {
            const d = field(x, y, z);
            gradient(x, y, z, g);
            const scale = d / Math.max(g.lengthSq(), 1e-8);
            x -= g.x * scale; y -= g.y * scale; z -= g.z * scale;
        }
        // Never let projection jump across a thin feature.
        if (length3(x - ox, y - oy, z - oz) > cell) { x = ox; y = oy; z = oz; }
        positions[v] = x; positions[v + 1] = y; positions[v + 2] = z;
        gradient(x, y, z, g).normalize();
        normals[v] = g.x; normals[v + 1] = g.y; normals[v + 2] = g.z;
    }

    const indices: number[] = [];
    const a = new Vector3(), b = new Vector3(), c = new Vector3(), d = new Vector3();
    const load = (target: Vector3, index: number) => target.fromArray(positions, index * 3);
    const emitTriangle = (i0: number, i1: number, i2: number) => {
        load(a, i0); load(b, i1); load(c, i2);
        const face = b.sub(a).cross(c.sub(a));
        const nxSum = normals[i0 * 3] + normals[i1 * 3] + normals[i2 * 3];
        const nySum = normals[i0 * 3 + 1] + normals[i1 * 3 + 1] + normals[i2 * 3 + 1];
        const nzSum = normals[i0 * 3 + 2] + normals[i1 * 3 + 2] + normals[i2 * 3 + 2];
        if (face.x * nxSum + face.y * nySum + face.z * nzSum >= 0) indices.push(i0, i1, i2);
        else indices.push(i0, i2, i1);
    };
    const steps = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let k = 1; k < nz - 1; k++) {
        for (let j = 1; j < ny - 1; j++) {
            for (let i = 1; i < nx - 1; i++) {
                const here = values[point(i, j, k)] < 0;
                for (let axis = 0; axis < 3; axis++) {
                    const [di, dj, dk] = steps[axis];
                    if ((values[point(i + di, j + dj, k + dk)] < 0) === here) continue;
                    const [u, w] = [steps[(axis + 1) % 3], steps[(axis + 2) % 3]];
                    const quad = [
                        cellIndex(i - u[0] - w[0], j - u[1] - w[1], k - u[2] - w[2]),
                        cellIndex(i - w[0], j - w[1], k - w[2]),
                        cellIndex(i, j, k),
                        cellIndex(i - u[0], j - u[1], k - u[2]),
                    ].map((index) => cellVertex[index]);
                    if (quad.some((index) => index < 0)) continue;
                    // Split along the shorter diagonal for better-shaped triangles.
                    load(a, quad[0]); load(b, quad[1]); load(c, quad[2]); load(d, quad[3]);
                    if (a.distanceToSquared(c) <= b.distanceToSquared(d)) {
                        emitTriangle(quad[0], quad[1], quad[2]);
                        emitTriangle(quad[0], quad[2], quad[3]);
                    } else {
                        emitTriangle(quad[0], quad[1], quad[3]);
                        emitTriangle(quad[1], quad[2], quad[3]);
                    }
                }
            }
        }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("normal", new BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    return geometry;
}

/**
 * Indexed parametric surface over u ∈ [0, 1), v ∈ [0, 1]. Wrapped directions share their
 * seam vertices, so smooth normals have no seam.
 */
export function parametric(
    surface: (u: number, v: number) => Vec3,
    uSegments: number,
    vSegments: number,
    { wrapU = false, wrapV = false } = {},
) {
    const uCount = wrapU ? uSegments : uSegments + 1;
    const vCount = wrapV ? vSegments : vSegments + 1;
    const positions = new Float32Array(uCount * vCount * 3);
    for (let j = 0; j < vCount; j++) {
        for (let i = 0; i < uCount; i++) {
            positions.set(surface(i / uSegments, j / vSegments), (j * uCount + i) * 3);
        }
    }
    const indices: number[] = [];
    for (let j = 0; j < vSegments; j++) {
        for (let i = 0; i < uSegments; i++) {
            const a = j * uCount + i;
            const b = j * uCount + (i + 1) % uCount;
            const c = ((j + 1) % vCount) * uCount + (i + 1) % uCount;
            const d = ((j + 1) % vCount) * uCount + i;
            indices.push(a, b, d, b, c, d);
        }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

/** Flip triangle winding when most normals point toward `center` rather than away from it. */
export function orientOutward(geometry: BufferGeometry, center: Vec3 = [0, 0, 0]) {
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    let score = 0;
    for (let i = 0; i < position.count; i++) {
        score += (position.getX(i) - center[0]) * normal.getX(i)
            + (position.getY(i) - center[1]) * normal.getY(i)
            + (position.getZ(i) - center[2]) * normal.getZ(i);
    }
    return score >= 0 ? geometry : flipWinding(geometry);
}

/** Reverse every triangle and its normals. */
export function flipWinding(geometry: BufferGeometry) {
    const normal = geometry.getAttribute("normal");
    const index = geometry.index!;
    for (let i = 0; i < index.count; i += 3) {
        const second = index.getX(i + 1);
        index.setX(i + 1, index.getX(i + 2));
        index.setX(i + 2, second);
    }
    for (let i = 0; i < normal.count; i++) normal.setXYZ(i, -normal.getX(i), -normal.getY(i), -normal.getZ(i));
    return geometry;
}

/** Smooth cubic interpolation through sorted keyframes `[t, ...values]`. */
export function keyframes(frames: number[][]) {
    return (t: number) => {
        if (t <= frames[0][0]) return frames[0].slice(1);
        const last = frames[frames.length - 1];
        if (t >= last[0]) return last.slice(1);
        let i = 0;
        while (frames[i + 1][0] < t) i++;
        const p0 = frames[Math.max(i - 1, 0)], p1 = frames[i], p2 = frames[i + 1], p3 = frames[Math.min(i + 2, frames.length - 1)];
        const span = p2[0] - p1[0];
        const s = (t - p1[0]) / span;
        const s2 = s * s, s3 = s2 * s;
        return p1.slice(1).map((_, k) => {
            const m1 = (p2[k + 1] - p0[k + 1]) / (p2[0] - p0[0]) * span;
            const m2 = (p3[k + 1] - p1[k + 1]) / (p3[0] - p1[0]) * span;
            return (2 * s3 - 3 * s2 + 1) * p1[k + 1] + (s3 - 2 * s2 + s) * m1
                + (-2 * s3 + 3 * s2) * p2[k + 1] + (s3 - s2) * m2;
        });
    };
}
