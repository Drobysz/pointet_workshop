import type { AppLocale } from "@/i18n/routing";
import type { LegalDocument, LegalSharedContent } from "./types";

export type { ContentBlock, InlineContent, LegalDocument, LegalSharedContent } from "./types";
export { fillLegalVariables } from "./legalEntity";

/** Every legal document; the slug is also the last segment of its URL. */
export const LEGAL_DOCUMENT_SLUGS = [
    "legal_notice",
    "privacy_policy",
    "cookies_policy",
    "refund_policy",
    "seller_policy",
    "seller_rules",
] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENT_SLUGS)[number];

// Each document is written once per language: `_content/{locale}/{slug}.json`.
export async function getLegalDocument(
    locale: AppLocale,
    slug: LegalDocumentSlug,
): Promise<LegalDocument> {
    return (await import(`./${locale}/${slug}.json`)).default;
}

/** Wording reused by several documents: operator details, definitions. */
export async function getLegalSharedContent(locale: AppLocale): Promise<LegalSharedContent> {
    return (await import(`./${locale}/shared.json`)).default;
}
