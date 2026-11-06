"use client";

import { ObjectSection } from "../shared/ObjectSection";
import type { Object3DProps } from "../shared/types";

export function SatinDress3D(props: Object3DProps) {
    return <ObjectSection kind="dress" label="Satin slip gown with a sweetheart bodice and a flowing, deeply folded skirt" {...props} />;
}
