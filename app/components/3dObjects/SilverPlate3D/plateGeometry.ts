import { TorusGeometry } from "three";
import { lathe, mergeParts } from "../shared/geometry";

export function createPlateGeometry() {
    // Closed section: underside, rolled edge, sloping rim, recessed eating surface.
    const body = lathe([
        [0, -0.09], [0.8, -0.09], [1.3, -0.09], [1.4, -0.065],
        [1.55, -0.01], [1.72, 0.06], [1.94, 0.115], [2.07, 0.12],
        [2.12, 0.145], [2.14, 0.19], [2.12, 0.23], [2.08, 0.25],
        [1.97, 0.235], [1.83, 0.21], [1.68, 0.16], [1.55, 0.08],
        [1.45, 0.015], [1.36, -0.01], [1.1, -0.018], [0, -0.018],
    ], 112);
    const detail = [];
    for (const [radius, height, thickness] of [[2.075, 0.247, 0.024], [1.77, 0.198, 0.014], [1.45, 0.013, 0.012]]) {
        const ring = new TorusGeometry(radius, thickness, 6, 112);
        ring.rotateX(Math.PI / 2);
        ring.translate(0, height, 0);
        detail.push(ring);
    }
    // Chased elliptical loops, merged into one draw call rather than 64 meshes.
    for (let i = 0; i < 64; i++) {
        const angle = i / 64 * Math.PI * 2;
        const petal = new TorusGeometry(0.055, 0.009, 4, 12);
        petal.scale(0.72, 1.8, 1);
        petal.rotateX(Math.PI / 2);
        petal.translate(0, 0.224, 1.94);
        petal.rotateY(angle);
        detail.push(petal);
    }
    return { body, detail: mergeParts(detail) };
}
