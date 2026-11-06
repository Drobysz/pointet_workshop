"use client";

import { preorderApi } from "@/api/api";
import { Id } from "@/api/types/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import useSWR from 'swr';
import {
    Footer,
    RegisterItemList,
} from "./_sections";
import { CircularProgress } from "@mui/material";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { useTranslations } from "next-intl";

export const PreorderView = ({
    preorderId
}: {
    preorderId: Id;
})=> {
    const t = useTranslations("common.states");
    const { authStatus } = useContext(GlobalContext);

    const {
        data,
        error,
        isLoading
    } = useSWR(
        authStatus === "authenficated" 
            ? "user-preorder"
            : "guest-preorder",
        ()=> authStatus === "authenficated"
            ? preorderApi.getPreorder(preorderId)
            : preorderApi.getGuestPreorder(preorderId)
    );

    const preorder = data?.data;

    console.log(preorder)
    if (!preorder) {
        return;
    }

    console.log();

    return (
        <>
            {(isLoading || error) &&
                <div className="h-[70vh] w-full flex items-center justify-center">
                    {isLoading && 
                        <CircularProgress 
                            size={30}
                            color="inherit"
                        />
                    }
                    {error &&
                        <h2 className={cn(
                            jersey10.className,
                            "text-3xl"
                        )}>
                            {t("loadFailed")}
                        </h2>
                    }
                </div>
            }
            {preorder &&
                <div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        <RegisterItemList 
                            registerItems={preorder.registers ?? []}
                        />
                    </div>
                    <Footer 
                        preorder={preorder}
                    />
                </div>
            }
        </>
    )
}
