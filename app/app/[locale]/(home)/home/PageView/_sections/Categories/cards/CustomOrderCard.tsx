"use client"

import { InteractionCard } from "@/components"
import Image from "next/image"
import s from "../style.module.scss";
import { monserrat_semibold } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useState } from "react";
import { motion } from "framer-motion";

export const CustomOrderCard = ()=> {
    const [hover, setHover] = useState(false);

    return (
        <InteractionCard
            className={s.card}
            link="/custom_order"
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <h3
                className={cn(
                    s.card_title, 
                    monserrat_semibold.className
                )}
            >
                Make custom order
            </h3>
            
            <p className={s.card_subtitle}>
                You have a furniture to restore or want a custom bag? On this matter you can directly contact me.
            </p>

            <motion.div
                className="
                    absolute
                    drop-shadow-2xl
                    origin-bottom-left
                "
                animate={
                    hover 
                    ? {
                        rotate: 10,
                        left: -65,
                        bottom: 5,
                        scale: 1.5
                    }
                    : {
                        rotate: 15,
                        left: -55,
                        bottom: 0,
                        scale: 1.1
                    }
                }
            >
                <Image
                    src="/category/pencils.png"
                    width={200}
                    height={100}
                    alt="category bag"
                />
            </motion.div>
            <motion.div
                className="
                    absolute 
                    drop-shadow-2xl
                    origin-bottom-right
                "
                animate={
                    hover 
                    ? {
                        rotate: -20,
                        right: -100,
                        bottom: 20,
                        scale: 1.45
                    }
                    : {
                        rotate: -15,
                        right: -100,
                        bottom: 10,
                        scale: 1.2
                    }
                }
                >
                <Image
                    src="/category/rulers.png"
                    width={200}
                    height={100}
                    alt="category bag"
                />
            </motion.div>
        </InteractionCard>
    )
}
