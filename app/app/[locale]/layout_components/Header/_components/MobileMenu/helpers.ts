import type { CSSProperties } from "react";

/** Position of a block in the staggered entrance of the menu. */
export const getItemStyle = (index: number)=> (
    { "--item-index": index } as CSSProperties
);
