import { motion, useTransform } from "framer-motion";
import { cn } from "@/helpers";
import { OutfitImage } from "../OutfitImage/OutfitImage";
import type { CurvedCardProps } from "./CurvedCard.props";
import s from "./style.module.scss";

const DEPTH_RANGE = 1.2;
const SIDE_FORWARD_RATIO = 0.045;
const CENTER_BACK_RATIO = 0.13;
const CENTER_DEPTH_RANGE = 0.08;
const CENTER_DEPTH_RATIO = 0.01;
const MAX_TILT = 28;

const depthAtDistance = (distance: number, range: number) => {
    const progress = Math.min(distance / range, 1);
    return (1 + Math.cos(progress * Math.PI)) / 2;
};

export const CurvedCard = ({
    src,
    alt,
    index,
    trackIndex,
    perspective,
    filterId,
    isNearby,
    isEager,
}: CurvedCardProps) => {
    const trackOffset = useTransform(trackIndex, (current) => index - current);
    const rotateY = useTransform(trackOffset, (distance) => {
        const progress = Math.min(Math.abs(distance), 1);
        const tilt = progress * progress * (3 - 2 * progress);
        return -Math.sign(distance) * MAX_TILT * tilt;
    });
    const depthRatio = useTransform(trackOffset, (offset) => {
        const distance = Math.abs(offset);
        const arc = depthAtDistance(distance, DEPTH_RANGE);
        const arcDepth = arc * (CENTER_BACK_RATIO + SIDE_FORWARD_RATIO);
        const centerDepth = depthAtDistance(distance, CENTER_DEPTH_RANGE);
        return arcDepth - SIDE_FORWARD_RATIO + centerDepth * CENTER_DEPTH_RATIO;
    });
    const z = useTransform(() => -depthRatio.get() * perspective.get());

    return (
        <motion.div
            // Off-screen cards are neither painted nor run through the
            // displacement filter, so only the visible few are rasterised.
            className={cn(s.frame, !isNearby && s.frame_far)}
            style={{ z, rotateY }}
        >
            <OutfitImage
                src={src}
                alt={alt}
                eager={isEager}
                filterId={isNearby ? filterId : undefined}
            />
        </motion.div>
    );
};
