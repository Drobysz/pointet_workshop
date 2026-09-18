"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function WineGlass3D(props: Object3DProps) {
    return <ObjectSection kind="wine" label="Crystal wine glass partially filled with red wine" {...props} />;
}
