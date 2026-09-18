import type { Metadata } from "next";
import { LegalPageLayout } from "../../_components/LegalPageLayout";
import { LegalSection } from "../../_components/LegalSection";
import { LegalContent } from "../../_components/LegalContent";
import content from "./content.json";

export const metadata: Metadata = content.metadata;

export default async function CookiesPolicyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <LegalPageLayout title={content.title} lastUpdated={content.lastUpdated}>
            {content.sections.map((section, index) => (
                <LegalSection
                    key={section.id}
                    id={section.id}
                    number={index + 1}
                    title={section.title}
                >
                    <LegalContent blocks={section.blocks} locale={locale} />
                </LegalSection>
            ))}
        </LegalPageLayout>
    );
}
