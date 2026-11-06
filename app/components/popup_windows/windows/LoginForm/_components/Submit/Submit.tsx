"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { MainBtn } from "@/components/buttons/MainBtn/MainBtn"
import { cn } from "@/helpers";
import { CircularProgress } from "@mui/material";
import { useContext } from "react";
import { useTranslations } from "next-intl";

export const Submit = ({
    isFilled,
    isPending,
}: {
    isFilled: boolean;
    isPending: boolean;
})=> {
    const t = useTranslations("auth.login");
    const { setPopUpWindow } = useContext(GlobalContext);

    return (
        <div className="flex flex-col gap-2">
            <MainBtn
                type="submit"
                disabled={!isFilled}
                className={cn(!isFilled && "opacity-70 cursor-not-allowed!")}
            >
                {!isPending ? t("submit") : <CircularProgress size={15} />}
            </MainBtn>
            <p className="flex gap-1 text-sm text-zinc-500 justify-center">
                {t.rich("noAccount", {
                    link: (chunks)=> (
                        <span
                            className="hover:underline hover:text-red-400 cursor-pointer text-red-300"
                            onClick={()=> setPopUpWindow("RegisterForm")}
                        >
                            {chunks}
                        </span>
                    ),
                })}
            </p>
        </div>
    )
}
