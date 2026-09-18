"use client"

import { usePathname, useRouter } from "@/i18n/navigation";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { useLocale } from "next-intl"
import { MouseEvent, useState } from "react";
import s from "./style.module.scss";
import cn from "classnames";

export const LangBar = ()=> {
    const [hover, setHover] = useState(false);
    const [opened, setOpened] = useState(false);

    const r = useRouter();
    const pn = usePathname();
    const l_raw = useLocale();

    const c_l = l_raw.includes('en')
        ? 'en'
        : l_raw;

    const langs = [
        { code: 'en', flag: '🇬🇧' },
        { code: 'de', flag: '🇩🇪' },
        { code: 'fr', flag: '🇫🇷' },
        { code: 'it', flag: '🇮🇹' },
        { code: 'ru', flag: '🇷🇺' }
    ];

    const data = langs.find((lang) => lang.code === c_l);
    const accessibleLangs = langs.filter(lng=> lng.code != c_l);

    const switchLocale = (newLocale: string) => {
        if (newLocale !== c_l) {
            r.replace(pn, { locale: newLocale });
            r.refresh();
        }
    };
    const handleChange = (e: MouseEvent<HTMLLIElement>)=> {
        const lang = e.currentTarget.getAttribute('value') as string;

        setOpened(false);
        switchLocale(lang);
    };

    return (
        <motion.div
            className={cn(
                opened ? "rounded-b-2xl" : "rounded-2xl",
                s.body,
            )}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> {
                setHover(false)
                setOpened(false)
            }}
            transition={{
                type: "tween",
                duration: 0.1,
                ease: "easeIn",
            }}
            initial={{ translateX: '0%' }}
            animate={{ translateX: hover ? '-15%' : '49%' }}
        >
            <div className="relative">
                {opened &&
                    <motion.ul 
                        className={s.lang_list}
                        initial={{ translateY: '-70%' }}
                        animate={{ translateY: '-100%' }}
                    >
                        {accessibleLangs.map((l, i)=> 
                            <li 
                                key={`key_tab_${i}_lang_${l.code}`}
                                className={s.lang_sel}
                                value={l.code}
                                onClick={handleChange}
                            >
                                <span className="pt-0.5">
                                    {l.flag}
                                </span> 
                                <span>
                                    {l.code}
                                </span>
                            </li>
                        )}
                    </motion.ul>
                }
            </div>
            <button 
                className={s.lang_btn}
                onClick={()=> setOpened(p=> !p)}
            >
                <span className="pt-0.5">
                    {data!.flag}
                </span> 
                <span>
                    {data!.code}
                </span>
            </button>
        </motion.div>
    )
}