import { useGeometry } from "../shared/useGeometry";

export default function SilverForkModel() {
    const geometry = useGeometry("fork");
    return (
        <group rotation={[0, -0.18, -0.1]}>
            <mesh geometry={geometry.silver}>
                <meshPhysicalMaterial color="#d9dce0" metalness={1} roughness={0.21} clearcoat={0.25} />
            </mesh>
            <mesh geometry={geometry.gold}>
                <meshStandardMaterial color="#b89b60" metalness={1} roughness={0.29} />
            </mesh>
        </group>
    );
}
