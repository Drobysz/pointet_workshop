import type { CSSProperties, RefObject } from "react";

export type ObjectKind = "curated" | "bag" | "dress";

/** Passed to every model so it can run bounded ambient motion only while visible. */
export interface ModelProps {
    active: boolean;
    reducedMotion: boolean;
    /** Narrow viewports get a stacked arrangement where a model supports one. */
    portrait: boolean;
}

export interface Object3DProps {
    id?: string;
    className?: string;
    style?: CSSProperties;
    /** Localize the accessible object description when needed. */
    label?: string;
    instructions?: string;
    fallbackText?: string;
    /** Off by default so a settled viewer consumes no animation frames. */
    idleMotion?: boolean;
}

export interface ObjectSceneProps {
    kind: ObjectKind;
    sectionRef: RefObject<HTMLElement | null>;
    active: boolean;
    reducedMotion: boolean;
    idleMotion: boolean;
    fallbackText: string;
}
