import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
    AdditiveBlending, BackSide, Color, CubeCamera, DoubleSide, HalfFloatType, Mesh,
    PlaneGeometry, Scene, ShaderMaterial, SphereGeometry, WebGLCubeRenderTarget,
} from "three";
import type { ColorRepresentation, WebGLRenderer } from "three";

// [x, y, z, width, height, intensity]: key, fill, top, ground bounce, back rim, front, overhead strip.
const panels = [
    [-4, 3, 3, 2, 7, 5], [4, 1, 2, 1, 6, 3], [0, 5, -2, 5, 3, 4],
    [-2, -3, 2, 4, 1, 1.5], [0, 1, -5, 3, 5, 2],
    [-2, 0, 6, 4, 7, 1.5], [0, 6, 1, 6, 2, 2],
] as const;

const panelVertex = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
// Softbox falloff: bright core, feathered edges. Mirror finishes reflect gradients, not hard cards.
const panelFragment = /* glsl */ `
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
        vec2 d = abs(vUv - 0.5) * 2.0;
        float falloff = 1.0 - smoothstep(0.35, 1.0, max(d.x, d.y));
        gl_FragColor = vec4(uColor * falloff, 1.0);
    }`;
const domeVertex = /* glsl */ `
    varying vec3 vDirection;
    void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
// Dark ground, a tinted horizon band and a pale sky give metal a readable horizon line.
const domeFragment = /* glsl */ `
    uniform vec3 uGround;
    uniform vec3 uHorizon;
    uniform vec3 uSky;
    varying vec3 vDirection;
    void main() {
        float y = normalize(vDirection).y;
        vec3 color = mix(uGround, uHorizon, smoothstep(-0.35, 0.02, y));
        color = mix(color, uSky, smoothstep(0.05, 0.75, y));
        gl_FragColor = vec4(color, 1.0);
    }`;

function mountStudio(gl: WebGLRenderer, scene: Scene, tint: ColorRepresentation) {
    // Built from Three.js primitives, without the HDR/EXR/gain-map loaders and portal
    // pulled in by the general-purpose environment component.
    const studio = new Scene();
    const accent = new Color(tint);
    const domeGeometry = new SphereGeometry(20, 32, 16);
    const dome = new ShaderMaterial({
        vertexShader: domeVertex,
        fragmentShader: domeFragment,
        side: BackSide,
        depthWrite: false,
        uniforms: {
            uGround: { value: new Color("#25272c") },
            uHorizon: { value: new Color("#6d727b").lerp(accent, 0.45) },
            uSky: { value: new Color("#c9cdd4").lerp(accent, 0.25) },
        },
    });
    studio.add(new Mesh(domeGeometry, dome));

    const panelGeometry = new PlaneGeometry(1, 1);
    const materials: ShaderMaterial[] = [dome];
    for (const [x, y, z, width, height, intensity] of panels) {
        const material = new ShaderMaterial({
            vertexShader: panelVertex,
            fragmentShader: panelFragment,
            side: DoubleSide,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
            uniforms: { uColor: { value: new Color().setScalar(intensity) } },
        });
        materials.push(material);
        const panel = new Mesh(panelGeometry, material);
        panel.position.set(x, y, z);
        panel.scale.set(width, height, 1);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
    }
    const target = new WebGLCubeRenderTarget(256, { type: HalfFloatType });
    const previous = scene.environment;
    const autoClear = gl.autoClear;
    try {
        gl.autoClear = true;
        new CubeCamera(0.1, 1000, target).update(gl, studio);
        scene.environment = target.texture;
    } catch (error) {
        target.dispose();
        throw error;
    } finally {
        gl.autoClear = autoClear;
        domeGeometry.dispose();
        panelGeometry.dispose();
        materials.forEach((material) => material.dispose());
    }
    return () => {
        scene.environment = previous;
        target.dispose();
    };
}

/** Bakes the studio reflection once. `tint` lets reflections pick up the section's backdrop. */
export function StudioEnvironment({ tint = "#8a8f98" }: { tint?: ColorRepresentation }) {
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        const dispose = mountStudio(gl, scene, tint);
        invalidate();
        return dispose;
    }, [gl, scene, invalidate, tint]);

    return (
        <>
            <ambientLight intensity={0.25} />
            <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff8ee" />
        </>
    );
}
