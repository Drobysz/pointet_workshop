import { ComponentType } from "react";
import motionTags from "./motionsTags";
import { HTMLMotionProps } from "framer-motion";

export type MotionComponent = ComponentType<HTMLMotionProps<"div">>;
export type ViewRevealTag = keyof typeof motionTags;
export type AnimationType = "blurred" | "disclosure";

export type ViewRevealProps = Omit<
    HTMLMotionProps<"div">,
    "initial" | "whileInView" | "viewport" | "transition"

> & {
    as?: ViewRevealTag;
    animationType?: AnimationType;
};