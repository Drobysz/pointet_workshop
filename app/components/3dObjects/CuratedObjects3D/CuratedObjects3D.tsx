"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function CuratedObjects3D(props: Object3DProps) {
    return <ObjectSection kind="curated" {...props} />;
}
