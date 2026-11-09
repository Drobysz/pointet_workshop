import type { MotionValue } from "framer-motion";

export interface CurvedCardProps {
    src: string;
    alt: string;
    index: number;
    trackIndex: MotionValue<number>;
    perspective: MotionValue<number>;
    filterId: string;
    /** False when the card is too far from the centre to be on screen. */
    isNearby: boolean;
    /** Loads the image at once instead of waiting for it to come near. */
    isEager: boolean;
}
