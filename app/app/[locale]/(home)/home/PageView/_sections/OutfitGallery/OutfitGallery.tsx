"use client";

import { GridContainer } from "@/components";
import { after } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { OutfitCarousel } from "./_components/OutfitCarousel/OutfitCarousel";
import { OUTFITS } from "./outfits";
import s from "./style.module.scss";

export const OutfitGallery = () => {
    const t = useTranslations("home.outfitGallery");
    const tunnelRef = useRef<HTMLDivElement>(null);
    // "start start" → "end end" is the native "contain" view-timeline
    // range, so the progress tracking can be handed to the browser.
    const { scrollYProgress } = useScroll({
        target: tunnelRef,
        offset: ["start start", "end end"],
    });

    // The sticky viewport sits below the site header. Its height is
    // written straight to a custom property: no render depends on it.
    useEffect(() => {
        const tunnel = tunnelRef.current;
        const header = document.querySelector<HTMLElement>(
            "[data-site-header]",
        );
        if (!tunnel || !header) return;

        const measure = () => tunnel.style.setProperty(
            "--header-height",
            `${header.offsetHeight}px`,
        );
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(header);

        return () => {
            observer.disconnect();
            tunnel.style.removeProperty("--header-height");
        };
    }, []);

    return (
        <GridContainer
            outerClassName={s.section}
            innerClassName={cn(s.tunnel, after.className)}
            style={{
                // The scroll length of the section follows the slide count.
                "--slide-count": OUTFITS.length,
            } as CSSProperties}
            ref={tunnelRef}
        >
            <div className={s.elevator}>
                <h2 
                    className={s.title} 
                    id="outfit-gallery-title"
                >
                    {t("title")}
                </h2>
                <OutfitCarousel progress={scrollYProgress} />
            </div>
        </GridContainer>
    );
};
