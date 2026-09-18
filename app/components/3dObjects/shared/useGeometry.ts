import { use, useEffect, useState } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { preloadGeometry } from "./geometryData";
import type { ObjectKind } from "./types";

type AttributeLayout = { offset: number; count: number; type: string };
type MeshLayout = Record<"position" | "normal" | "index", AttributeLayout>;

function decodeGeometry(data: ArrayBuffer) {
    const length = new DataView(data).getUint32(0, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 4, length))) as Record<string, MeshLayout>;
    const start = Math.ceil((length + 4) / 4) * 4;
    return Object.fromEntries(Object.entries(header).map(([name, layout]) => {
        const geometry = new BufferGeometry();
        for (const key of ["position", "normal", "index"] as const) {
            const { type, offset, count } = layout[key];
            const ArrayType = type === "Uint16Array" ? Uint16Array : type === "Uint32Array" ? Uint32Array : Float32Array;
            const attribute = new BufferAttribute(new ArrayType(data, start + offset, count), key === "index" ? 1 : 3);
            if (key === "index") geometry.setIndex(attribute);
            else geometry.setAttribute(key, attribute);
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
