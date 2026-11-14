import type { Metadata } from "next";
import { connection } from "next/server";
import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { getLegalDocument, getLegalSharedContent } from "../_content";
import type { LegalDocumentSlug } from "../_content";
import { LegalContent } from "./LegalContent";
import { LegalPageLayout } from "./LegalPageLayout";
import { LegalSection } from "./LegalSection";

type LegalPageParams = Promise<{ locale: string }>;

export async function getLegalMetadata(
    slug: LegalDocumentSlug,
    params: LegalPageParams,
): Promise<Metadata> {
    const { locale } = await params;
    const document = await getLegalDocument(SeoService.resolveLocale(locale), slug);

    return SeoService.getPageMetadata({
        locale,
        pathname: `/docs/${slug}`,
        title: document.title,
        description: document.description,
    });
}

export async function LegalDocumentPage({
    slug,
    params,
}: {
    slug: LegalDocumentSlug;
    params: LegalPageParams;
}) {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    setRequestLocale(currentLocale);

    const [document, shared] = await Promise.all([
        getLegalDocument(currentLocale, slug),
        getLegalSharedContent(currentLocale),
    ]);

    // The operator details (`LEGAL_*`) are read from the environment of the
    // running server, so a deployment can change them without a rebuild.
    await connection();

    return (
        <LegalPageLayout
            title={document.title}
            lastUpdated={document.lastUpdated}
            lastUpdatedLabel={shared.lastUpdatedLabel}
            locale={currentLocale}
        >
            {document.sections.map((section, index) => (
                <LegalSection
                    key={section.id}
                    id={section.id}
                    number={index + 1}
                    title={section.title}
                >
                    <LegalContent
                        blocks={section.blocks}
                        shared={shared.blocks}
                        locale={currentLocale}
                    />
                </LegalSection>
            ))}
        </LegalPageLayout>
    );
}
