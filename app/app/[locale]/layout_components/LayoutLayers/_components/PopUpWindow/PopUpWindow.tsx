'use client';

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import { PopUpWindows } from '@/components';
import styles from "./PopUpWindow.module.scss";

export const PopUpWindow = () => {
    const { 
        popUpWindow
    } = useContext(GlobalContext);
    const popUpWindowContent = PopUpWindows[popUpWindow];

    return (
        popUpWindow !== "none" ? (
            <section 
                className={styles.overlay} 
                aria-label="Authentication dialog"
            >
                {popUpWindowContent}
            </section>
        ) : null
    )
}
