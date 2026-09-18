"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function SilverPlate3D(props: Object3DProps) {
    return <ObjectSection kind="plate" label="Polished silver serving plate with a decorative rim" {...props} />;
}
