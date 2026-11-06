import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
    AdditiveBlending, BackSide, Color, CubeCamera, DoubleSide, HalfFloatType, Mesh, MeshBasicMaterial,
    PlaneGeometry, Scene, ShaderMaterial, SphereGeometry, WebGLCubeRenderTarget,
} from "three";
import type { ColorRepresentation, Material, WebGLRenderer } from "three";

/** [x, y, z, width, height, intensity] of a card facing the object. */
type Card = readonly [number, number, number, number, number, number];

interface StudioPreset {
    ground: string;
    horizon: string;
    sky: string;
    /** How much of the section tint reaches the horizon and the sky. */
    tint: readonly [horizon: number, sky: number];
    /** Feathered, additive softboxes. */
    panels: readonly Card[];
    /** Hard-edged black cards (intensity unused); they mask softboxes behind them. */
    flags: readonly Card[];
    resolution: number;
}

export const studioPresets = {
    // General studio for lacquer, ceramics, satin and gold.
    studio: {
        ground: "#2c2e34",
        horizon: "#6d727b",
        sky: "#c9cdd4",
        tint: [0.45, 0.25],
        panels: [
            [-4, 3, 3, 2, 7, 5], [4, 1, 2, 1, 6, 3], [0, 5, -2, 5, 3, 4],
            // A broad white sweep below, as on a product table: lower curves read bright, not black.
            [0, -4, 1, 10, 6, 2.6], [0, 1, -5, 3, 5, 2],
            // Split front light: the dark gap between the boxes draws vertical streaks.
            [-2.4, 0.5, 6, 2.8, 9, 3], [2.4, 0.5, 6, 1.6, 9, 2.4],
            [0, 6, 1, 6, 2, 2],
        ],
        flags: [],
        resolution: 256,
    },
    // Product photography for mirror chrome: a pale seamless sweep, large soft sources and
    // black flags. Chrome shows its surroundings, so realism comes from a believable room
    // with crisp dark cards, not from the material.
    product: {
        ground: "#d6d8dc",
        // The far studio wall at eye level: the dark band across the middle of the body.
        horizon: "#55595f",
        sky: "#eceef1",
        tint: [0.3, 0.1],
        panels: [
            [0, 6, 0.5, 7, 4, 3.2],         // overhead silk
            [-4.6, 0.8, 2, 1.8, 9, 4.2],    // left strip
            [4.6, 0.8, 1.2, 1.4, 9, 3.4],   // right strip
            [0, 0.6, 7, 7, 6, 1.7],         // large frontal diffusion
            [0, 1.2, -6, 6, 5, 1.6],        // backdrop wash for the rim
            [0, -4.5, 1.5, 12, 7, 1.2],     // floor sweep bounce
        ],
        flags: [
            // Broad black flags either side of the lens: the large dark masses that frame
            // a bright centre in product shots of polished metal.
            [-3.1, 0.6, 4.8, 2.8, 12, 0],
            [2.9, 0.6, 5, 2, 12, 0],
        ],
        resolution: 512,
    },
} satisfies Record<string, StudioPreset>;

export type StudioPresetName = keyof typeof studioPresets;

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
        float falloff = 1.0 - smoothstep(0.6, 1.0, max(d.x, d.y));
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

function mountStudio(gl: WebGLRenderer, scene: Scene, tint: ColorRepresentation, preset: StudioPreset) {
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
            uGround: { value: new Color(preset.ground) },
            uHorizon: { value: new Color(preset.horizon).lerp(accent, preset.tint[0]) },
            uSky: { value: new Color(preset.sky).lerp(accent, preset.tint[1]) },
        },
    });
    studio.add(new Mesh(domeGeometry, dome));

    const panelGeometry = new PlaneGeometry(1, 1);
    const materials: Material[] = [dome];
    const place = (mesh: Mesh, [x, y, z, width, height]: Card, order: number) => {
        mesh.position.set(x, y, z);
        mesh.scale.set(width, height, 1);
        mesh.lookAt(0, 0, 0);
        mesh.renderOrder = order;
        studio.add(mesh);
    };
    // Flags draw first and write depth, so softboxes behind them are masked.
    const flag = new MeshBasicMaterial({ color: "#121316", side: DoubleSide, toneMapped: false });
    materials.push(flag);
    for (const card of preset.flags) place(new Mesh(panelGeometry, flag), card, 1);
    for (const card of preset.panels) {
        const intensity = card[5];
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
        place(new Mesh(panelGeometry, material), card, 2);
    }
    const target = new WebGLCubeRenderTarget(preset.resolution, { type: HalfFloatType });
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
export function StudioEnvironment({
    tint = "#8a8f98",
    preset = "studio",
}: { tint?: ColorRepresentation; preset?: StudioPresetName }) {
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        const dispose = mountStudio(gl, scene, tint, studioPresets[preset]);
        invalidate();
        return dispose;
    }, [gl, scene, invalidate, tint, preset]);

    return (
        <>
            <ambientLight intensity={0.25} />
            <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff8ee" />
        </>
    );
}
