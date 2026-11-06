import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Group } from "three";
import { useGeometry } from "../shared/useGeometry";
import { MAX_AMBIENT_STEP } from "../shared/ambient";
import type { ModelProps } from "../shared/types";

type Pose = { position: [number, number, number]; rotation: [number, number, number]; scale: number };

// Wide screens spread the pieces around the headline; narrow screens stack them.
const layouts: Record<"wide" | "portrait", Record<"corset" | "bag" | "bracelet", Pose>> = {
    wide: {
        corset: { position: [0.2, 0.12, -0.55], rotation: [0.04, 0.3, 0], scale: 1.05 },
        bag: { position: [-1.05, -0.62, 0.45], rotation: [0.08, 0.42, -0.06], scale: 0.95 },
        bracelet: { position: [1.2, 0.5, 0.35], rotation: [1.12, 0, -0.38], scale: 0.95 },
    },
    portrait: {
        corset: { position: [0.05, 0.45, -0.55], rotation: [0.04, 0.3, 0], scale: 1.05 },
        bag: { position: [-0.55, -0.95, 0.45], rotation: [0.08, 0.38, -0.05], scale: 0.9 },
        bracelet: { position: [0.78, -0.55, 0.6], rotation: [1.12, 0, -0.38], scale: 0.82 },
    },
};

// Independent, slow, bounded drift per object: [float phase, float speed, sway amplitude].
const drift = { corset: [0, 0.5, 0.2], bag: [2.1, 0.62, 0.16], bracelet: [4.2, 0.55, 0] } as const;

export default function CuratedObjectsModel({ active, reducedMotion, portrait }: ModelProps) {
    const geometry = useGeometry("curated");
    const layout = layouts[portrait ? "portrait" : "wide"];
    const corset = useRef<Group>(null);
    const bag = useRef<Group>(null);
    const bracelet = useRef<Group>(null);
    const spin = useRef<Group>(null);
    const clock = useRef(0);
    const invalidate = useThree((state) => state.invalidate);

    useFrame((_, delta) => {
        if (!active || reducedMotion) return;
        const time = clock.current += Math.min(delta, MAX_AMBIENT_STEP);
        const objects = { corset: corset.current, bag: bag.current, bracelet: bracelet.current };
        for (const name of ["corset", "bag", "bracelet"] as const) {
            const object = objects[name];
            if (!object) continue;
            const pose = layout[name];
            const [phase, speed, sway] = drift[name];
            const wave = Math.sin(time * speed + phase);
            object.position.y = pose.position[1] + wave * 0.05;
            object.rotation.y = pose.rotation[1] + Math.sin(time * speed * 0.55 + phase) * sway;
        }
        // The bangle turns slowly about its own axis; its silhouette barely changes.
        if (spin.current) spin.current.rotation.y = time * 0.22;
        invalidate();
    });

    return (
        <group>
            <group ref={corset} {...layout.corset} scale={layout.corset.scale}>
                <mesh geometry={geometry.corset}>
                    {/* White duchess satin: soft base, bright sheen, light gloss; lined, so double sided. */}
                    <meshPhysicalMaterial
                        color="#efe9e1"
                        roughness={0.3}
                        metalness={0}
                        sheen={0.35}
                        sheenColor="#ffffff"
                        sheenRoughness={0.4}
                        clearcoat={0.55}
                        clearcoatRoughness={0.16}
                        side={DoubleSide}
                    />
                </mesh>
            </group>
            <group ref={bag} {...layout.bag} scale={layout.bag.scale}>
                <mesh geometry={geometry.bagBody}>
                    {/* Cherry lacquered leather. */}
                    <meshPhysicalMaterial color="#7d0b1d" roughness={0.3} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
                </mesh>
                <mesh geometry={geometry.bagGold}>
                    <meshStandardMaterial color="#e3bd72" metalness={1} roughness={0.16} />
                </mesh>
            </group>
            <group ref={bracelet} {...layout.bracelet} scale={layout.bracelet.scale}>
                <group ref={spin}>
                    <mesh geometry={geometry.bracelet}>
                        <meshStandardMaterial color="#e3bd72" metalness={1} roughness={0.14} />
                    </mesh>
                </group>
            </group>
        </group>
    );
}
