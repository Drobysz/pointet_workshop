"use client"

import { InteractionCard } from "@/components"
import Image from "next/image"
import s from "../style.module.scss";
import { monserrat_semibold } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useState } from "react";
import { motion } from "framer-motion";

export const BagCard = ()=> {
    const [hover, setHover] = useState(false);

    return (
        <InteractionCard
            className={s.card}
            link="/goods"
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <h3
                className={cn(
                    s.card_title, 
                    monserrat_semibold.className
                )}
            >
                Handbags
            </h3>

            <p className={s.card_subtitle}>
                Get familiarize with the handmade handbags I make.
            </p>
            
            <motion.div
                className="
                    absolute
                    drop-shadow-2xl
                "
                animate={
                    hover 
                    ? {
                        rotate: -10,
                        right: -42,
                        bottom: -15,
                        scale: 1.3
                    }
                    : {
                        rotate: -15,
                        right: -52,
                        bottom: -57,
                        scale: 1.15
                    }
                }
            >
                <Image
                    src="/category/hero.png"
                    width={250}
                    height={100}
                    alt="category bag"
                />
            </motion.div>
            <motion.div
                className="
                    absolute 
                    drop-shadow-2xl
                "
                animate={
                    hover 
                    ? {
                        rotate: -15,
                        right: 30,
                        bottom: -18,
                        scale: 1.2
                    }
                    : {
                        rotate: -10,
                        right: -10,
                        bottom: -40,
                        scale: 1.1
                    }
                }
             >
                <Image
                    src="/category/bag.png"
                    width={170}
                    height={100}
                    alt="category bag"
                />
            </motion.div>
        </InteractionCard>
    )
}
