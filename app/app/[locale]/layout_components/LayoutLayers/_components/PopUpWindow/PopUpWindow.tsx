'use client';

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import { PopUpWindows } from '@/components';
import styles from "./PopUpWindow.module.scss";
import { useTranslations } from "next-intl";

export const PopUpWindow = () => {
    const { 
        popUpWindow
    } = useContext(GlobalContext);
    const t = useTranslations("auth");
    const popUpWindowContent = PopUpWindows[popUpWindow];

    return (
        popUpWindow !== "none" ? (
            <section 
                className={styles.overlay} 
                aria-label={t("dialogLabel")}
            >
                {popUpWindowContent}
            </section>
        ) : null
    )
}
