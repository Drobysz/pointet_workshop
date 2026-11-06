import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";
import { CurvedCard } from "../CurvedCard/CurvedCard";
import { ScreenCurve } from "../ScreenCurve/ScreenCurve";
import type { OutfitCarouselProps } from "./OutfitCarousel.props";
import s from "./style.module.scss";

const OUTFITS = Array.from({ length: 12 }, (_, index) => ({
    src: `/outfit/example${index + 1}.jpg`,
    number: index + 1,
}));

const SLIDE_INDICES = OUTFITS.map((_, index) => index);
const SCROLL_STOPS = SLIDE_INDICES.map((index) => index / (OUTFITS.length - 1));
const CENTER_HOLD = 0.1;

const easeWithCenterHold = (progress: number) => {
    const travel = (progress - CENTER_HOLD) / (1 - 2 * CENTER_HOLD);
    const t = Math.max(0, Math.min(travel, 1));
    return t * t * (3 - 2 * t);
};

export const OutfitCarousel = ({ progress }: OutfitCarouselProps) => {
    const t = useTranslations("home.outfitGallery");
    const trackRef = useRef<HTMLUListElement>(null);
    const pitch = useMotionValue(0);
    const perspective = useTransform(pitch, (step) => Math.max(520, step * 1.7));
    const filterId = `outfit-curve-${useId()}`;
    const trackIndex = useTransform(
        progress,
        SCROLL_STOPS,
        SLIDE_INDICES,
        { ease: easeWithCenterHold },
    );
    // Percentages resolve against the track, just like its grid columns.
    const x = useTransform(trackIndex, (index) =>
        `calc(var(--slide-step) * ${-index})`,
    );

    useEffect(() => {
        const track = trackRef.current;
        const first = track?.firstElementChild;
        const second = first?.nextElementSibling;
        if (!track || !first || !second) return;

        const measure = () => {
            // Read layout boxes independently of the projected card surfaces.
            const firstLeft = first.getBoundingClientRect().left;
            const secondLeft = second.getBoundingClientRect().left;
            pitch.set(Math.abs(secondLeft - firstLeft));
        };

        measure();

        const observer = new ResizeObserver(measure);

        observer.observe(track);
        observer.observe(first);
        
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
                            alt={t("imageAlt", { number })}
                            index={index}
                            trackIndex={trackIndex}
                            perspective={perspective}
                            filterId={filterId}
                        />
                    </li>
                ))}
            </motion.ul>
        </motion.div>
    );
};
