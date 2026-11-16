import type { Metadata } from "next";
import { Id } from "@/api/types/api";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { OrderView } from "./page/OrderView";
import { CircularProgress } from "@mui/material";

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string; order_id: Id }>
}): Promise<Metadata> {
    const { locale, order_id } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.order",
    });

    return {
        // Route params are strings at runtime: keep the id unformatted.
        title: t("title", { id: String(order_id) }),
    };
}

export default async function OrderPage({
    params
}: {
    params: Promise<{ locale: string; order_id: Id }>
}) {
    const { locale, order_id } = await params;
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
            <OrderView
                orderId={Number(order_id)}
            />
        </Suspense>
    )
}
