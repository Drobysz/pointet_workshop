import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Group, MeshPhysicalMaterial } from "three";
import { useGeometry } from "../shared/useGeometry";
import { MAX_AMBIENT_STEP } from "../shared/ambient";
import type { ModelProps } from "../shared/types";

const BASE_YAW = -0.28;

export default function SatinDressModel({ active, reducedMotion }: ModelProps) {
    const geometry = useGeometry("dress");
    const turntable = useRef<Group>(null);
    const breeze = useRef({ value: 0 });
    const invalidate = useThree((state) => state.invalidate);

    // A slight vertex sway in the skirt reads as fabric movement without any cloth solver.
    // The bodice above the hip is untouched; amplitude grows toward the hem.
    const onBeforeCompile = useCallback<MeshPhysicalMaterial["onBeforeCompile"]>((shader) => {
        shader.uniforms.uBreeze = breeze.current;
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nuniform float uBreeze;")
            .replace("#include <begin_vertex>", `#include <begin_vertex>
                float sway = smoothstep(0.1, -1.8, position.y);
                float around = atan(position.x, position.z);
                transformed.x += sin(uBreeze * 0.9 + position.y * 1.7 + around * 2.0) * 0.024 * sway;
                transformed.z += cos(uBreeze * 0.7 + position.y * 1.3 - around * 3.0) * 0.02 * sway;`);
    }, []);

    useFrame((_, delta) => {
        if (!active || reducedMotion) return;
        const time = breeze.current.value += Math.min(delta, MAX_AMBIENT_STEP);
        if (turntable.current) turntable.current.rotation.y = BASE_YAW + Math.sin(time * 0.25) * 0.12;
        invalidate();
    });

    return (
        <group ref={turntable} rotation={[0, BASE_YAW, 0]}>
            <mesh geometry={geometry.fabric}>
                {/* Silk satin: soft base, sheen for the grazing glow, light clear coat for the gloss band. */}
                <meshPhysicalMaterial
                    color="#5c0a2a"
                    roughness={0.36}
                    metalness={0}
                    sheen={0.85}
                    sheenColor="#f0a6c0"
                    sheenRoughness={0.32}
                    clearcoat={0.45}
                    clearcoatRoughness={0.22}
                    side={DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>
        </group>
    );
}
