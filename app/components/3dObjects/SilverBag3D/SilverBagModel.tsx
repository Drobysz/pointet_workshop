import { useRef } from "react";
import type { Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGeometry } from "../shared/useGeometry";
import { MAX_AMBIENT_STEP } from "../shared/ambient";
import type { ModelProps } from "../shared/types";

const BASE_YAW = -0.16;

export default function SilverBagModel({ active, reducedMotion }: ModelProps) {
    const geometry = useGeometry("bag");
    const turntable = useRef<Group>(null);

    // A slow, bounded turn about the vertical axis lets reflections travel over the surface.
    const clock = useRef(0);
    const invalidate = useThree((state) => state.invalidate);
    useFrame((_, delta) => {
        if (!active || reducedMotion) return;
        clock.current += Math.min(delta, MAX_AMBIENT_STEP);
        if (turntable.current) turntable.current.rotation.y = BASE_YAW + Math.sin(clock.current * 0.32) * 0.16;
        invalidate();
    });

    return (
        <group ref={turntable} rotation={[0.04, BASE_YAW, 0]}>
            <mesh geometry={geometry.body}>
                {/* Polished silver: near-mirror roughness, neutral reflectance, no clear coat
                    (a coat over metal adds a second, plastic-looking reflection). */}
                <meshStandardMaterial
                    color="#f3f3f1"
                    metalness={1}
                    roughness={0.045}
                    envMapIntensity={1}
                />
            </mesh>
        </group>
    );
}
