import {
    motion,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks";
import { OUTFITS } from "../../outfits";
import { CurvedCard } from "../CurvedCard/CurvedCard";
import { OutfitImage } from "../OutfitImage/OutfitImage";
import { ScreenCurve } from "../ScreenCurve/ScreenCurve";
import type { OutfitCarouselProps } from "./OutfitCarousel.props";
import s from "./style.module.scss";

const SLIDE_INDICES = OUTFITS.map((_, index) => index);
const SCROLL_STOPS = SLIDE_INDICES.map((index) => index / (OUTFITS.length - 1));
const CENTER_HOLD = 0.1;
// The stage shows the centre slide and part of its two neighbours: cards
// further away than this are off screen at every breakpoint.
const VISIBLE_RANGE = 2;
// Loaded at once, so the gallery is not blank when it is reached.
const EAGER_IMAGES = 3;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const easeWithCenterHold = (progress: number) => {
    const travel = (progress - CENTER_HOLD) / (1 - 2 * CENTER_HOLD);
    const t = Math.max(0, Math.min(travel, 1));
    return t * t * (3 - 2 * t);
};

interface CarouselViewProps {
    progress: MotionValue<number>;
    imageAlt: (number: number) => string;
}

/** Scroll-driven carousel: every per-frame value is a MotionValue. */
const MotionCarousel = ({ progress, imageAlt }: CarouselViewProps) => {
    const trackRef = useRef<HTMLUListElement>(null);
    const filterId = `outfit-curve-${useId()}`;
    // Distance between two slides in px, the one measurement that feeds
    // the track position, the perspective and the card depth.
    const pitch = useMotionValue(0);
    const perspective = useTransform(pitch, (step) => Math.max(520, step * 1.7));
    const trackIndex = useTransform(
        progress,
        SCROLL_STOPS,
        SLIDE_INDICES,
        { ease: easeWithCenterHold },
    );
    const x = useTransform(() => -trackIndex.get() * pitch.get());

    // Coarse position used to cull off-screen cards. It changes at most
    // once per slide, never on every frame.
    const [activeIndex, setActiveIndex] = useState(0);
    useMotionValueEvent(trackIndex, "change", (index) => {
        setActiveIndex(Math.round(index));
    });

    useEffect(() => {
        const track = trackRef.current;
        const first = track?.children[0];
        const second = track?.children[1];
        if (
            !track
            || !(first instanceof HTMLElement)
            || !(second instanceof HTMLElement)
        ) return;

        // Offsets are layout positions: the projected card surfaces and
        // the track translation do not affect them.
        const measure = () => pitch.set(second.offsetLeft - first.offsetLeft);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(track);

        return () => observer.disconnect();
    }, [pitch]);

    return (
        <motion.div
            className={s.stage}
            style={{ perspective }}
            role="region"
            aria-labelledby="outfit-gallery-title"
            tabIndex={0}
        >
            <ScreenCurve id={filterId} />
            <motion.ul className={s.track} ref={trackRef} style={{ x }}>
                {OUTFITS.map(({ src, number }, index) => (
                    <li key={src} className={s.slide}>
                        <CurvedCard
                            src={src}
                            alt={imageAlt(number)}
                            index={index}
                            trackIndex={trackIndex}
                            perspective={perspective}
                            filterId={filterId}
                            isNearby={Math.abs(index - activeIndex) <= VISIBLE_RANGE}
                            isEager={index < EAGER_IMAGES}
                        />
                    </li>
                ))}
            </motion.ul>
        </motion.div>
    );
};

/** Reduced-motion fallback: a plain, swipeable row of slides. */
const StaticCarousel = ({ imageAlt }: Pick<CarouselViewProps, "imageAlt">) => (
    <div
        className={s.stage}
        role="region"
        aria-labelledby="outfit-gallery-title"
        tabIndex={0}
    >
        <ul className={s.track}>
            {OUTFITS.map(({ src, number }, index) => (
                <li key={src} className={s.slide}>
                    <div className={s.frame}>
                        <OutfitImage
                            src={src}
                            alt={imageAlt(number)}
                            eager={index < EAGER_IMAGES}
                        />
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

export const OutfitCarousel = ({ progress }: OutfitCarouselProps) => {
    const t = useTranslations("home.outfitGallery");
    // Resolves to `false` on the server, like the stylesheet's default.
    const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
    const imageAlt = (number: number) => t("imageAlt", { number });

    return prefersReducedMotion
        ? <StaticCarousel imageAlt={imageAlt} />
        : <MotionCarousel progress={progress} imageAlt={imageAlt} />;
};
