import type { MeshPhysicalMaterial } from "three";

/** Retain studio reflections when compositing physical glass over a CSS backdrop.
 * Three's transmission alpha accounts for absorption, but not reflected light.
 * This keeps the standard PBR shader and adds no textures or rendering passes.
 */
export const compositeGlassReflections: MeshPhysicalMaterial["onBeforeCompile"] = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
        float reflectionCoverage = clamp(max(max(totalSpecular.r, totalSpecular.g), totalSpecular.b), 0.0, 1.0);
        gl_FragColor.a = 1.0 - (1.0 - gl_FragColor.a) * (1.0 - reflectionCoverage);
        gl_FragColor.rgb /= max(gl_FragColor.a, 0.0001);`,
    );
};
