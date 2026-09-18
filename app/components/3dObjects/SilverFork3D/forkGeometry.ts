import { BufferGeometry, ExtrudeGeometry, Shape } from "three";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { mergeParts, ribbon } from "../shared/geometry";

function forkOutline() {
    const shape = new Shape();
    shape.moveTo(0, -2.2);
    shape.bezierCurveTo(-0.29, -2.18, -0.27, -1.86, -0.17, -1.61);
    shape.bezierCurveTo(-0.1, -1.4, -0.2, -1.18, -0.145, -0.95);
    shape.bezierCurveTo(-0.09, -0.67, -0.07, -0.3, -0.085, 0.1);
    shape.bezierCurveTo(-0.09, 0.38, -0.34, 0.55, -0.36, 0.84);
    shape.lineTo(-0.345, 2.05);
    shape.quadraticCurveTo(-0.315, 2.28, -0.282, 2.05);
    shape.lineTo(-0.21, 1.09);
    shape.quadraticCurveTo(-0.188, 0.9, -0.139, 1.09);
    shape.lineTo(-0.042, 2.17);
    shape.quadraticCurveTo(0, 2.38, 0.042, 2.17);
    shape.lineTo(0.139, 1.09);
    shape.quadraticCurveTo(0.188, 0.9, 0.21, 1.09);
    shape.lineTo(0.282, 2.05);
    shape.quadraticCurveTo(0.315, 2.28, 0.345, 2.05);
    shape.lineTo(0.36, 0.84);
    shape.bezierCurveTo(0.34, 0.55, 0.09, 0.38, 0.085, 0.1);
    shape.bezierCurveTo(0.07, -0.3, 0.09, -0.67, 0.145, -0.95);
    shape.bezierCurveTo(0.2, -1.18, 0.1, -1.4, 0.17, -1.61);
    shape.bezierCurveTo(0.27, -1.86, 0.29, -2.18, 0, -2.2);
    shape.closePath();
    return shape;
}

function bow(y: number) {
    // Forged neck and curved tines give the silhouette depth even from the side.
    return y > 0.2 ? -0.13 * Math.sin((y - 0.2) * 1.65) : 0.025 * Math.sin(y * 2);
}

function forgeSurface(geometry: BufferGeometry) {
    const vertices = geometry.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const z = vertices.getZ(i);
        const crown = 0.025 * Math.max(0, 1 - (x / 0.38) ** 2);
        vertices.setZ(i, z * (1 + crown / 0.0645) + bow(vertices.getY(i)));
    }
    geometry.computeVertexNormals();
    return geometry;
}

export function createForkGeometry() {
    const extrusion = new ExtrudeGeometry(forkOutline(), {
        depth: 0.085,
        bevelEnabled: true,
        bevelThickness: 0.022,
        bevelSize: 0.018,
        bevelSegments: 3,
        curveSegments: 12,
        steps: 1,
    });
    // Subdivide long face triangles before bending; otherwise the curved neck
    // produces large diagonal planar patches instead of a smooth forged surface.
    const tessellated = new TessellateModifier(0.22, 7).modify(extrusion);
    const body = mergeVertices(tessellated);
    extrusion.dispose();
    tessellated.dispose();
    body.translate(0, 0, -0.0425);

    const ornaments = [];
    const accents = [];
    for (const face of [-1, 1]) {
        for (const side of [-1, 1]) {
            const z = face * 0.083;
            ornaments.push(ribbon([
                [0, -2.09, z], [side * 0.14, -1.97, z], [side * 0.12, -1.77, z],
                [side * 0.045, -1.56, z], [side * 0.095, -1.33, z],
                [side * 0.065, -1.1, z], [0, -0.93, z],
            ], 0.016, 36));
            ornaments.push(ribbon([
                [side * 0.09, -1.93, z], [side * 0.035, -1.85, z + face * 0.01],
                [side * 0.055, -1.75, z], [side * 0.105, -1.81, z],
            ], 0.012, 18));
            accents.push(ribbon([
                [0, -1.12, z + face * 0.012], [side * 0.075, -0.99, z],
                [side * 0.08, -0.85, z], [0, -0.99, z + face * 0.012],
            ], 0.018, 18));
        }
        ornaments.push(ribbon([[0, -0.8, face * 0.074], [0, -0.4, face * 0.074], [0, 0.14, face * 0.074]], 0.012, 20));
    }
    return {
        silver: mergeParts([body, ...ornaments].map(forgeSurface)),
        gold: mergeParts(accents.map(forgeSurface)),
    };
}
