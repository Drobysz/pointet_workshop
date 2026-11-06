import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import ProfilePageView from "./page/PageView";

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
        namespace: "seo.profile",
    });

    return {
        title: t("title"),
    };
}

export default async function ProfilePage ({
    params
}: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <ProfilePageView />
    )
}
