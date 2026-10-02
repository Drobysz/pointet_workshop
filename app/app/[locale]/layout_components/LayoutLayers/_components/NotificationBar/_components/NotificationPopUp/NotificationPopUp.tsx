"use client";

import { NotificationStatus } from "@/app/[locale]/context/global.interface";
import s from "./style.module.scss";
import cn from "classnames";
import {
    Ban,
    BookAlert,
    Check,
    LucideIcon
} from "lucide-react";

export const NotificationPopUp = ({
    children,
    status
}: {
    children: string,
    status: NotificationStatus
})=> {
    const icons: Record<
        NotificationStatus, LucideIcon | null
    > = {
        "error": Ban,
        "alert": BookAlert,
        "success": Check,
        "none": null
    };
    const Icon = icons[status];
    const iconSize = children.length > 50 ? "w-10" : "w-5";

    return (
        <div
            className={cn(
                s.notif_popup, {
                    ["bg-red-200 border-red-500 text-red-500"]: status == "error",
                    ["bg-orange-100 border-amber-400 text-amber-400"]: status == "alert",
                    ["bg-green-200 border-green-500 text-green-500"]: status == "success",
                }
            )}
        >
            {Icon !== null && 
                <div className={cn(
                    s.icon_space, 
                    iconSize
                )}>
                    <Icon
                        className="pt-0.5"
                        width={25}
                        height={25}
                    />
                </div>
            }
            {children}
        </div>
    )
}