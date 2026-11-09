"use client";

import { GridContainer } from "@/components"
import s from "./style.module.scss";
import { useRef } from "react";
import { 
    useScroll,
} from "framer-motion";
import {
    SpreadingGradient,
    ColumnLinks,
    DocLinks,
    Noise,
} from "./_components";
import { useWindowWidth } from "@/hooks";
import { cn } from "@/helpers";

export const Footer = ()=> {
    const isSpreadVisible = useWindowWidth(640) as boolean;
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center end"]
    });

    return (
        <footer
            ref={ref}
            className={cn(
                s.footer_background,
                !isSpreadVisible && "pt-2 rounded-2xl"
            )}
        >
            {isSpreadVisible &&
                <SpreadingGradient 
                    progress={scrollYProgress}
                />
            }
            <GridContainer
                innerClassName={s.inner_content}
            >
                <ColumnLinks />
                <DocLinks />
            </GridContainer>
            <Noise />
        </footer>
    )
}
