import { CustomBlending, OneFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor } from "three";
import { useGeometry } from "../shared/useGeometry";
import { compositeGlassReflections } from "./glassMaterial";

export default function WineGlassModel() {
    const geometry = useGeometry("wine");
    return (
        <group>
            <mesh geometry={geometry.wine}>
                {/* Explicit blending keeps this slightly translucent volume in the
                    opaque capture used by the surrounding glass's transmission pass. */}
                <meshPhysicalMaterial
                    color="#3b000a"
                    roughness={0.12}
                    metalness={0}
                    ior={1.345}
                    clearcoat={0.35}
                    clearcoatRoughness={0.07}
                    envMapIntensity={0.55}
                    opacity={0.94}
                    blending={CustomBlending}
                    blendSrc={SrcAlphaFactor}
                    blendDst={OneMinusSrcAlphaFactor}
                    blendSrcAlpha={OneFactor}
                    blendDstAlpha={OneMinusSrcAlphaFactor}
                />
            </mesh>
            <mesh geometry={geometry.glass}>
                <meshPhysicalMaterial
                    color="#ffffff"
                    transmission={0.99}
                    roughness={0.045}
                    metalness={0}
                    ior={1.52}
                    thickness={0.065}
                    attenuationColor="#e7f1ee"
                    attenuationDistance={4}
                    envMapIntensity={1.15}
                    onBeforeCompile={compositeGlassReflections}
                />
            </mesh>
        </group>
    );
}
