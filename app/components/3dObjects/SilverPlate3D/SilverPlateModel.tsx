import { useGeometry } from "../shared/useGeometry";

export default function SilverPlateModel() {
    const geometry = useGeometry("plate");
    return (
        <group rotation={[0.88, 0, 0]} position={[0, -0.03, 0]}>
            <mesh geometry={geometry.body}>
                <meshPhysicalMaterial
                    color="#d9dcdf"
                    metalness={1}
                    roughness={0.23}
                    clearcoat={0.35}
                    clearcoatRoughness={0.18}
                />
            </mesh>
            <mesh geometry={geometry.detail}>
                <meshStandardMaterial color="#e7e5e0" metalness={1} roughness={0.18} />
            </mesh>
        </group>
    );
}
