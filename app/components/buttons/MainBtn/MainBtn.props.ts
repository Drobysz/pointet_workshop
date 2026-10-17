import { HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export interface MainBtnProps
extends HTMLMotionProps<"button">{
    className?: string;
    children: ReactNode;
}
