import { geometryAssets } from "./geometryAssets";
import type { ObjectKind } from "./types";

const downloads = new Map<ObjectKind, Promise<ArrayBuffer>>();

/** Share downloads, not disposable GPU buffers, between instances. */
export function preloadGeometry(kind: ObjectKind) {
    let pending = downloads.get(kind);
    if (!pending) {
        pending = fetch(geometryAssets[kind]).then(async (response) => {
            if (!response.ok || !response.body) throw new Error(`Unable to load ${kind} geometry`);
            return new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        });
        downloads.set(kind, pending);
        // Keep prefetch errors handled; React.use will send them to the boundary.
        void pending.catch(() => {});
    }
    return pending;
}
