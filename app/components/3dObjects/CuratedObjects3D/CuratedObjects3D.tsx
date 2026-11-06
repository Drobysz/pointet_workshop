"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function CuratedObjects3D(props: Object3DProps) {
    return <ObjectSection kind="curated" label="Curated objects: a red lacquered half-moon handbag, a glazed ceramic vase and a twisted gold bangle" {...props} />;
}
