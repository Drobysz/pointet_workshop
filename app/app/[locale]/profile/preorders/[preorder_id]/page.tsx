import type { Metadata } from "next";
import { Id } from "@/api/types/api";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { PreorderView } from "./page/PreorderView";
import { CircularProgress } from "@mui/material";

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string; preorder_id: Id }>
}): Promise<Metadata> {
    const { locale, preorder_id } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.preorder",
    });

    return {
        // Route params are strings at runtime: keep the id unformatted.
        title: t("title", { id: String(preorder_id) }),
    };
}

export default async function OrderPage({
    params
}: {
    params: Promise<{ locale: string; preorder_id: Id }>
}) {
    const { locale, preorder_id } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <Suspense fallback={
            <div className="
                h-screen 
                w-full 
                text-zinc-700
                flex 
                items-center
                justify-center
            ">
                <CircularProgress 
                    color="inherit"
                    size={30}
                />
            </div>
        }>
            <PreorderView
                preorderId={Number(preorder_id)}
            />
        </Suspense>
    )
}
