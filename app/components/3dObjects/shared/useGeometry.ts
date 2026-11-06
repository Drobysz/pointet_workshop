import { use, useEffect, useState } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { preloadGeometry } from "./geometryData";
import type { ObjectKind } from "./types";

type AttributeLayout = { offset: number; count: number; type: string; min?: number[]; extent?: number[] };

/** Expand 16-bit quantized attributes to floats once, so materials need no shader changes. */
function dequantize(data: ArrayBuffer, start: number, key: "position" | "normal", layout: AttributeLayout) {
    const { type, offset, count, min, extent } = layout;
    if (type === "Float32Array") return new Float32Array(data, start + offset, count);
    const output = new Float32Array(count);
    if (key === "position" && min && extent) {
        const source = new Uint16Array(data, start + offset, count);
        for (let i = 0; i < count; i++) output[i] = min[i % 3] + source[i] / 65535 * extent[i % 3];
    } else {
        const source = new Int16Array(data, start + offset, count);
        for (let i = 0; i < count; i++) output[i] = source[i] / 32767;
    }
    return output;
}
type MeshLayout = Record<"position" | "normal" | "index", AttributeLayout>;

function decodeGeometry(data: ArrayBuffer) {
    const length = new DataView(data).getUint32(0, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 4, length))) as Record<string, MeshLayout>;
    const start = Math.ceil((length + 4) / 4) * 4;
    return Object.fromEntries(Object.entries(header).map(([name, layout]) => {
        const geometry = new BufferGeometry();
        const { type, offset, count } = layout.index;
        const IndexType = type === "Uint16Array" ? Uint16Array : Uint32Array;
        geometry.setIndex(new BufferAttribute(new IndexType(data, start + offset, count), 1));
        for (const key of ["position", "normal"] as const) {
            geometry.setAttribute(key, new BufferAttribute(dequantize(data, start, key, layout[key]), 3));
        }
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return [name, geometry];
    }));
}

/** Own buffers per mounted model; never dispose a different viewer's geometry. */
export function useGeometry(kind: ObjectKind): Record<string, BufferGeometry> {
    const data = use(preloadGeometry(kind));
    const [geometries] = useState(() => decodeGeometry(data));
    useEffect(() => () => {
        Object.values(geometries).forEach((geometry) => geometry.dispose());
    }, [geometries]);
    return geometries;
}
