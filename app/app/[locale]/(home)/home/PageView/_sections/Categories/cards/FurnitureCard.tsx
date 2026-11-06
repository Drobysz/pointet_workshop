"use client"

import { InteractionCard } from "@/components"
import Image from "next/image"
import s from "../style.module.scss";
import { monserrat_semibold } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export const FurnitureCard = ()=> {
    const t = useTranslations("home.categories.telegram");
    const [hover, setHover] = useState(false);

    return (
        <InteractionCard
            className={s.card}
            link="#"
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
                    z-30
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
                    src="/category/telegram.png"
                    width={150}
                    height={100}
                    alt={t("logoAlt")}
                />
            </motion.div>
            <motion.div
                className="
                    absolute 
                    drop-shadow-2xl
                    z-20
                "
                animate={
                    hover 
                    ? {
                        rotate: -15,
                        right: 40,
                        bottom: -8,
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
                    src="/category/megaphone.png"
                    width={200}
                    height={100}
                    alt={t("megaphoneAlt")}
                />
            </motion.div>
            <motion.div
                className="
                    absolute 
                    drop-shadow-2xl
                    origin-top-left
                    z-10
                "
                animate={
                    hover 
                    ? {
                        rotate: 15,
                        left: -20,
                        bottom: 30,
                        scale: 1.2,
                        opacity: 1,
                    }
                    : {
                        rotate: 15,
                        left: -20,
                        bottom: -20,
                        scale: 1.1,
                        opacity: 0,
                    }
                }
             >
                <Image
                    src="/category/news.png"
                    width={200}
                    height={100}
                    alt={t("newspaperAlt")}
                />
            </motion.div>
        </InteractionCard>
    )
}
