import { HTMLMotionProps } from "framer-motion";
import { Tag } from "../types";

export type SplitTextProps<T extends Tag> = Omit<
    HTMLMotionProps<T>,
    "children"
    | "ref"
    | "viewport"
    | "initial"
    | "whileInView"
> & {
    tag: T;
    children: string;
    animationType?: "unwrapping" | "blurred";
    viewportAmount?: number;
    delayChildren?: number;
    once?: boolean;
};