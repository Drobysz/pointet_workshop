"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function SilverFork3D(props: Object3DProps) {
    return <ObjectSection kind="fork" label="Decorative three-prong silver fork with small gold accents" {...props} />;
}
