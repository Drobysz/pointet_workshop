import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { SuccessView } from "./SuccessView";
import { CircularProgress } from "@mui/material";

interface LocaleParams {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({
    params
}: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.orderStatus",
    });

    return {
        title: t("title"),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function SuccessPage({
    params
}: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <Suspense fallback={
            <main className="w-full h-full">
                <CircularProgress 
                    size={30}
                />
            </main>
        }>
            <SuccessView />
        </Suspense>
    );
}
