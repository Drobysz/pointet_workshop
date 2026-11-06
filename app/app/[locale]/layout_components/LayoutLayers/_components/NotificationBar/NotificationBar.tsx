"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext, useEffect, useState } from "react";
import s from "./style.module.scss";
import { NotificationPopUp } from "./_components";
import { NotificationStatus } from "@/app/[locale]/context/global.interface";
import { AnimatePresence } from "framer-motion";

type Popup = {
    id: string;
    text: string;
    status: NotificationStatus;
};

export const NotificationBar = ()=> {
    const { notification } = useContext(GlobalContext);
    const [popUps, setPopUps] = useState<Popup[]>([]);

    useEffect(() => {
        if (!notification.text || notification.status === "none") return;

        const id = crypto.randomUUID();

        setTimeout(() => {
            setPopUps((prev) => [
                ...prev,
                {
                    id,
                    text: notification.text,
                    status: notification.status,
                },
            ]);
        }, 0);

        setTimeout(() => {
            setPopUps((prev) => prev.filter((popUp) => popUp.id !== id));
        }, 5000);
    }, [notification]);

    return (
        <div className={s.notification}>
            <AnimatePresence
                initial={false}
            >
                {popUps && popUps.map((popUp)=> (
                    <NotificationPopUp
                        key={popUp.id}
                        status={popUp.status}
                    >
                        {popUp.text}
                    </NotificationPopUp>
                ))}
            </AnimatePresence>
        </div>
    )
}