import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Color, CubeCamera, DoubleSide, HalfFloatType, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, WebGLCubeRenderTarget } from "three";
import type { WebGLRenderer } from "three";

const panels = [
    [-4, 3, 3, 2, 7, 5], [4, 1, 2, 1, 6, 3], [0, 5, -2, 5, 3, 4],
    [-2, -3, 2, 4, 1, 1.5], [0, 1, -5, 3, 5, 2],
    [-2, 0, 6, 4, 7, 1.5], [0, 6, 1, 6, 2, 2],
] as const;

function mountStudio(gl: WebGLRenderer, scene: Scene) {
    // Same studio panels, without the HDR/EXR/gain-map loaders and portal
    // pulled in by the general-purpose environment component.
    const studio = new Scene();
    studio.background = new Color("#41454c");
    const geometry = new PlaneGeometry(1, 1);
    const materials: MeshBasicMaterial[] = [];
    for (const [x, y, z, width, height, intensity] of panels) {
        const material = new MeshBasicMaterial({ color: new Color().setScalar(intensity), side: DoubleSide, toneMapped: false });
        materials.push(material);
        const panel = new Mesh(geometry, material);
        panel.position.set(x, y, z);
        panel.scale.set(width, height, 1);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
    }
    const target = new WebGLCubeRenderTarget(128, { type: HalfFloatType });
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
        geometry.dispose();
        materials.forEach((material) => material.dispose());
    }
    return () => {
        scene.environment = previous;
        target.dispose();
    };
}

export function StudioEnvironment() {
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const invalidate = useThree((state) => state.invalidate);

    useLayoutEffect(() => {
        const dispose = mountStudio(gl, scene);
        invalidate();
        return dispose;
    }, [gl, scene, invalidate]);

    return (
        <>
            <ambientLight intensity={0.25} />
            <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff8ee" />
        </>
    );
}
