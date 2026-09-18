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

export const Footer = ()=> {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center end"]
    });

    return (
        <footer
            ref={ref}
            className={s.footer_background}
        >
            <SpreadingGradient 
                progress={scrollYProgress}
            />
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
