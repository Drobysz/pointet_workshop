import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { PageView } from "./page/PageView";
import { Loading } from "./page/_components";

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
        namespace: "seo.basket",
    });

    return {
        title: t("title"),
    };
}

export default async function BasketPage ({
    params
}: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    // The view reads `useSearchParams`, which requires a Suspense boundary.
    return (
        <Suspense fallback={<Loading />}>
            <PageView />
        </Suspense>
    )
}
