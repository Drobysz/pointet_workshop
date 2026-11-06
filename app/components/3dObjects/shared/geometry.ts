import { BufferGeometry, CatmullRomCurve3, LatheGeometry, TubeGeometry, Vector2, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type Profile = Array<[radius: number, height: number]>;

export function lathe(profile: Profile, segments = 80) {
    return new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), segments);
}

/** Merge once on mount; source buffers are no longer needed after the copy. */
export function mergeParts(parts: BufferGeometry[]) {
    // No material samples UVs; dropping them lets UV-less procedural surfaces merge with primitives.
    parts.forEach((part) => part.deleteAttribute("uv"));
    const plain = parts.map((part) => part.index ? part.toNonIndexed() : part);
    const merged = mergeGeometries(plain);
    new Set([...parts, ...plain]).forEach((part) => part.dispose());
    if (!merged) throw new Error("Unable to assemble procedural object geometry.");
    return merged;
}

export function ribbon(points: Array<[number, number, number]>, radius = 0.018, segments = 28) {
    const path = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
    return new TubeGeometry(path, segments, radius, 6, false);
}
