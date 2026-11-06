'use client';

import cn from "classnames";
import { LogOut } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import s from "./style.module.scss";
import { useLogout } from "@/hooks/useLogout";
import { useTranslations } from "next-intl";

export const LogOutBtn = ({
    setIsOpen
}: {
    setIsOpen: Dispatch<SetStateAction<boolean>>
})=> {
    const t = useTranslations("navigation.account");
    const [hover, setHover] = useState(false);
    const {
        logOut,
        isPending,
    } = useLogout(setIsOpen);

    const animInitial = { opacity: 0, x: -10 };
    const animHovered = { opacity: 1, x: 0 };

    return (
        <button
            className={cn(
                s.btn_logout,
                "text-red-500 active:bg-red-500/10"
            )}
            type="button"
            disabled={isPending}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
            onClick={logOut}
        >

            <motion.span
                className="absolute"
                initial={animInitial}
                animate={hover ? animHovered : animInitial}
            >
                <LogOut
                    className="w-4 h-4"
                />
            </motion.span>

            <motion.span
                animate={hover ? {x: 20} : {x: 0}}
            >
                {!isPending
                    ? t("logOut")
                    : <CircularProgress
                        size={16}
                        color="error"
                    />
                }
            </motion.span>
        </button>
    )
}
