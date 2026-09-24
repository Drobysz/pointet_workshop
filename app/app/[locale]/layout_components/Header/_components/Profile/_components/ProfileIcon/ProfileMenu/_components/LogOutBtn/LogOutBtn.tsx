'use client';

import cn from "classnames";
import { LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { CircularProgress } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import s from "./style.module.scss";
// import { clearAuthenticatedCaches } from "@/hooks/userHooks";
// import { logOutQuery } from "@/queries/auth_queries/authQueries";

export const LogOutBtn = ()=> {
    // const { setIsLoggedIn, setNotification } = useContext(GlobalContext);
    const [hover, setHover] = useState(false);
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const animInitial = { opacity: 0, x: -10 };
    const animHovered = { opacity: 1, x: 0 };

    const t = useTranslations('header');

    // const handleClick = async () => {
    //     setPending(true);
    //     try {
    //         await logOutQuery();
    //     } catch {
    //         setNotification({ status: "error", text: t("logoutError") });
    //     } finally {
    //         setIsLoggedIn("unauth");
    //         await clearAuthenticatedCaches();
    //         setPending(false);
    //         router.push('/');
    //     }
    // };

    return (
        <button
            className={cn(
                s.btn_logout,
                "text-red-500 active:bg-red-500/10"
            )}
            type="button"
            disabled={pending}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
            // onClick={()=> handleClick()}
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
                {!pending
                    ? "Exit"
                    : <CircularProgress
                        size={16}
                        color="error"
                    />
                }
            </motion.span>
        </button>
    )
}
