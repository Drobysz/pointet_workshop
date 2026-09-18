import { SphereGeometry, TorusGeometry } from "three";
import { lathe, mergeParts } from "../shared/geometry";
import type { Profile } from "../shared/geometry";

export function createWineGeometry() {
    const outer: Profile = [
        [0, -0.32], [0.12, -0.3], [0.25, -0.22], [0.38, -0.08],
        [0.51, 0.12], [0.61, 0.35], [0.67, 0.6], [0.7, 0.85],
        [0.71, 1.1], [0.7, 1.35], [0.67, 1.6], [0.62, 1.85], [0.56, 2.1],
    ];
    const inner: Profile = [
        [0.537, 2.1], [0.598, 1.85], [0.648, 1.6], [0.678, 1.35],
        [0.688, 1.1], [0.678, 0.85], [0.646, 0.6], [0.584, 0.35],
        [0.478, 0.12], [0.341, -0.08], [0.205, -0.19], [0.09, -0.23], [0, -0.23],
    ];
    const bowl = lathe([...outer, ...inner], 96);
    const position = bowl.getAttribute("position");
    // Sixteen shallow cuts taper into the smooth upper bowl. Wall thickness is retained.
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        const angle = Math.atan2(x, z);
        const envelope = Math.max(0, 1 - Math.abs(y - 0.28) / 0.68);
        const cut = 1 - envelope * 0.065 * Math.pow(Math.sin(angle * 8), 2);
        position.setXYZ(i, x * cut, y, z * cut);
    }
    bowl.computeVertexNormals();

    const stem = lathe([
        [0, -2.11], [0.55, -2.11], [0.62, -2.08], [0.63, -2.045],
        [0.61, -2.01], [0.4, -1.99], [0.17, -1.95], [0.075, -1.86],
        [0.042, -1.66], [0.035, -1.2], [0.04, -0.68], [0.07, -0.43],
        [0.11, -0.32], [0, -0.29],
    ], 64);
    const collar = new SphereGeometry(0.115, 20, 12);
    collar.scale(1, 0.75, 1);
    collar.translate(0, -0.36, 0);
    const lip = new TorusGeometry(0.5485, 0.012, 6, 96);
    lip.rotateX(Math.PI / 2);
    lip.translate(0, 2.1, 0);

    // Closed liquid volume, including its flat top and a tiny raised meniscus.
    const wine = lathe([
        [0, -0.21], [0.09, -0.21], [0.195, -0.18], [0.327, -0.075],
        [0.456, 0.12], [0.56, 0.35], [0.624, 0.6], [0.642, 0.7],
        [0.64, 0.715], [0.625, 0.7], [0.45, 0.699], [0, 0.699],
    ], 80);

    return { glass: mergeParts([bowl, stem, collar, lip]), wine };
}
