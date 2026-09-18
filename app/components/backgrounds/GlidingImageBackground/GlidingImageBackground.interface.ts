import { HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export interface GlidingImageBackgroundProps extends HTMLMotionProps<"div"> {
    img_url?: string;
    withShadow?: boolean;
    scaling?: boolean;
    className?: string;
    children: ReactNode;
}
