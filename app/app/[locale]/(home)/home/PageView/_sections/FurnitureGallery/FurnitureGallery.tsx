"use client";

import { GridContainer } from "@/components";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after } from "@/fonts/fonts";
import { motion } from "framer-motion";
import Image from "next/image";

export const FurnitureGallery = ()=> {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
    });

    const x = useTransform(
        scrollYProgress, 
        [0, 1], 
        ["0%", "-150%"]
    );

    return (
        <GridContainer
            innerClassName={cn(
                s.tunnel,
                after.className
            )}
            ref={ref}
        >
            <div 
                className={s.elevator}
            >
                <h2
                    className={s.title}
                >
                    Examples of my furniture restoration
                </h2>
                <motion.div 
                    className="overflow-hidden"
                >
                    <motion.ul
                        className={s.gallery_list}
                        style={{ x }}
                    >
                        {Array(7).fill(true).map((_, idx)=>
                            <li
                                key={`furniture-example-${idx}`}
                                className={s.img_frame}
                            >
                                <Image
                                    src={`/furniture/example${idx + 1}.png`}
                                    className="object-cover"
                                    width={350}
                                    height={700}
                                    style={{
                                        height: "100%",
                                        width: "auto",
                                    }}
                                    alt="furniture restoration example"
                                />
                            </li>
                        )}   
                    </motion.ul>
                </motion.div>
            </div>
        </GridContainer>
    )
}
