import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { LegalPageLayout } from "../../_components/LegalPageLayout";
import { LegalSection } from "../../_components/LegalSection";
import { LegalContent } from "../../_components/LegalContent";
import content from "./content.json";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return SeoService.getPageMetadata({
        locale,
        pathname: "/docs/cookies_policy",
        title: content.title,
        description: content.metadata.description,
    });
}

export default async function CookiesPolicyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    setRequestLocale(currentLocale);

    return (
        <LegalPageLayout title={content.title} lastUpdated={content.lastUpdated}>
            {content.sections.map((section, index) => (
                <LegalSection
                    key={section.id}
                    id={section.id}
                    number={index + 1}
                    title={section.title}
                >
                    <LegalContent blocks={section.blocks} locale={currentLocale} />
                </LegalSection>
            ))}
        </LegalPageLayout>
    );
}
