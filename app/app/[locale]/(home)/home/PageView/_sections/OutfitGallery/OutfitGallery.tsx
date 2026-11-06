"use client";

import { GridContainer } from "@/components";
import { after } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { OutfitCarousel } from "./_components/OutfitCarousel/OutfitCarousel";
import s from "./style.module.scss";

export const OutfitGallery = () => {
    const t = useTranslations("home.outfitGallery");
    const tunnelRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const { scrollYProgress } = useScroll({
        target: tunnelRef,
        offset: [`start ${headerHeight}px`, "end end"],
    });

    useEffect(() => {
        const header = document.querySelector<HTMLElement>(
            "[data-site-header]",
        );
        if (!header) return;

        const measure = () => setHeaderHeight(header.offsetHeight);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(header);
        return () => observer.disconnect();
    }, []);

    return (
        <GridContainer
            outerClassName={s.section}
            innerClassName={cn(s.tunnel, after.className)}
            style={{
                "--header-height": `${headerHeight}px`,
            } as CSSProperties}
            ref={tunnelRef}
        >
            <div className={s.elevator}>
                <h2 className={s.title} id="outfit-gallery-title">
                    {t("title")}
                </h2>
                <OutfitCarousel progress={scrollYProgress} />
            </div>
        </GridContainer>
    );
};
