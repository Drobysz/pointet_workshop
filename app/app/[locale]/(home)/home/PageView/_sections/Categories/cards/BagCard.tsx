"use client"

import { InteractionCard } from "@/components"
import Image from "next/image"
import s from "../style.module.scss";
import { monserrat_semibold } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export const BagCard = ()=> {
    const t = useTranslations("home.categories.shop");
    const [hover, setHover] = useState(false);

    return (
        <InteractionCard
            className={s.card}
            link="/shop"
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <h3
                className={cn(
                    s.card_title, 
                    monserrat_semibold.className
                )}
            >
                {t("title")}
            </h3>

            <p className={s.card_subtitle}>
                {t("description")}
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
                    alt={t("toteAlt")}
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
                    alt={t("handbagAlt")}
                />
            </motion.div>
        </InteractionCard>
    )
}
