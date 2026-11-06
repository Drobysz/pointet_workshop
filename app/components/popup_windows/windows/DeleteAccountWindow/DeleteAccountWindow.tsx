"use client";

import { ShadowBorderWindow } from "@/components/windows/ShadowBorderWindow/ShadowBorderWindow"
import s from './style.module.scss';
import { cn } from "@/helpers";
import { after, tinyFive } from "@/fonts/fonts";
import { useContext, useState } from "react";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { userApi } from "@/api/api";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { CircularProgress } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export const DeleteAccountWindow = ()=> {
    const {
        user,
        userError,
        mutateUser,
        setPopUpWindow,
        setNotification,
    } = useContext(GlobalContext);

    const router = useRouter();
    const t = useTranslations();
    const [isPending, setIsPending] = useState(false);

    const handleCancelBtn = 
        ()=> setPopUpWindow("none");

    const handleClickDeleteBtn = async ()=> {
        if (!user || userError) return;

        setIsPending(true);

        try {
            await userApi.deleteUser(user.id);

            mutateUser();
            setNotification({
                status: "success",
                text: t("auth.deleteAccount.success")
            })
            router.push("/home");
        } catch (error) {
            const message = getApiErrorMessage(error, t);

            setNotification({
                status: "error",
                text: message
            });
        }

        setIsPending(false);
    }

    return (
        <ShadowBorderWindow>
            <div className="flex flex-col gap-6">
                <h3 className={cn(
                    s.title,
                    after.className
                )}>
                    {t("auth.deleteAccount.title")}
                </h3>

                <div className="flex flex-col gap-3">
                    <p className={cn(
                        s.desc
                    )}>
                        {t("auth.deleteAccount.description")}
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            className={cn(
                                s.default_btn,
                                s.cancel_btn,
                                tinyFive.className
                            )}
                            onClick={handleCancelBtn}
                        >
                            {t("common.actions.cancel")}
                        </button>

                        <button
                            className={cn(
                                s.default_btn,
                                s.continue_btn,
                                tinyFive.className
                            )}
                            onClick={handleClickDeleteBtn}
                        >
                            {isPending 
                                ? <CircularProgress
                                    color="inherit"
                                    size={10}
                                />
                                : t("common.actions.continue")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </ShadowBorderWindow>
    )
}
