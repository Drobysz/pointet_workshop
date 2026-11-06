import type { MotionValue } from "framer-motion";

export interface CurvedCardProps {
    src: string;
    alt: string;
    index: number;
    trackIndex: MotionValue<number>;
    perspective: MotionValue<number>;
    filterId: string;
}
