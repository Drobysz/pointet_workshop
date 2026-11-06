import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { PageView } from "./PageView/PageView";

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.sellers",
    });

    return SeoService.getPageMetadata({
        locale,
        pathname: "/sellers",
        title: t("title"),
        description: t("description"),
    });
}

export default async function SellersPage ({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <PageView />
    )
}
