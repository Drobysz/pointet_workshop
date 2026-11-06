import type { Metadata } from "next";
import { ReactNode } from "react"
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileHeader } from "./layout_components";
import { GridContainer } from "@/components";
import { SeoService, SITE_NAME } from "@/helpers";
import s from "./layout.module.scss";

interface LocaleParams {
    params: Promise<{ locale: string }>;
}

// Account pages are private: keep them out of search indexes.
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
        title: {
            default: t("defaultTitle"),
            template: `%s | ${SITE_NAME}`,
        },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function ProfileLayout ({
    children,
    params
}: Readonly<LocaleParams & {
    children: ReactNode;
}>) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <main className="min-h-screen pt-13 pb-30 max-md:pt-6 max-md:pb-16">
            <GridContainer innerClassName="px-4 max-md:px-3">
                <ProfileHeader />
                <section className={s.profile_section_frame}>
                    {children}
                </section>
            </GridContainer>
        </main>
    )
}
