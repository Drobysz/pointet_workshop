import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

// The tagline and description of the site are localized: see the
// `seo.site` messages.
export const SITE_NAME = "Pointet Workshop";

const FALLBACK_SITE_URL = "http://localhost:3000";
const DESCRIPTION_MAX_LENGTH = 160;

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
    en: "en_GB",
    fr: "fr_FR",
    de: "de_DE",
    it: "it_IT",
    ru: "ru_RU",
    uk: "uk_UA",
};

export interface PageMetadataParams {
    locale: string;
    /** Locale-less pathname of the page, e.g. "/shop". */
    pathname: string;
    title: string;
    description: string;
    /** Skips the "%s | Site name" template of the root layout. */
    isTitleAbsolute?: boolean;
    /** Absolute or root-relative image URLs; defaults to the generated brand image. */
    images?: string[];
    /** Private and transactional pages must stay out of search indexes. */
    isIndexable?: boolean;
}

export class SeoService {
    static getSiteUrl(): string {
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || FALLBACK_SITE_URL;

        return siteUrl.replace(/\/$/, "");
    }

    static resolveLocale(locale: string): Locale {
        return hasLocale(routing.locales, locale)
            ? locale
            : routing.defaultLocale;
    }

    static getOpenGraphLocale(locale: string): string {
        return OPEN_GRAPH_LOCALES[SeoService.resolveLocale(locale)];
    }

    static getLocalizedPath(locale: string, pathname: string): string {
        const normalizedPath = pathname === "/" ? "" : pathname;

        return `/${locale}${normalizedPath}`;
    }

    static getAbsoluteUrl(path: string): string {
        return `${SeoService.getSiteUrl()}${path}`;
    }

    /** hreflang map of every locale version of a page, including x-default. */
    static getLanguageAlternates(pathname: string): Record<string, string> {
        const languages: Record<string, string> = {};

        for (const locale of routing.locales) {
            languages[locale] = SeoService.getAbsoluteUrl(
                SeoService.getLocalizedPath(locale, pathname)
            );
        }

        languages["x-default"] = SeoService.getAbsoluteUrl(
            SeoService.getLocalizedPath(routing.defaultLocale, pathname)
        );

        return languages;
    }

    static truncateDescription(text: string): string {
        const normalizedText = text.replace(/\s+/g, " ").trim();

        if (normalizedText.length <= DESCRIPTION_MAX_LENGTH) {
            return normalizedText;
        }

        const cut = normalizedText.slice(0, DESCRIPTION_MAX_LENGTH - 1);
        const lastSpace = cut.lastIndexOf(" ");

        return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length)}…`;
    }

    /**
     * API image URLs are presigned and expire, so crawlers and social
     * previews need the permanent object URL without the signature.
     */
    static getStableAssetUrl(url: string): string {
        return url.split("?")[0];
    }

    static getDefaultImage(locale: string): string {
        return `${SeoService.getLocalizedPath(locale, "")}/opengraph-image`;
    }

    static getPageMetadata({
        locale,
        pathname,
        title,
        description,
        isTitleAbsolute = false,
        images,
        isIndexable = true,
    }: PageMetadataParams): Metadata {
        const currentLocale = SeoService.resolveLocale(locale);
        const canonical = SeoService.getAbsoluteUrl(
            SeoService.getLocalizedPath(currentLocale, pathname)
        );
        const socialTitle = isTitleAbsolute
            ? title
            : `${title} | ${SITE_NAME}`;
        const socialImages = images && images.length > 0
            ? images
            : [SeoService.getDefaultImage(currentLocale)];

        return {
            title: isTitleAbsolute ? { absolute: title } : title,
            description,
            alternates: {
                canonical,
                languages: SeoService.getLanguageAlternates(pathname),
            },
            // Nested metadata objects replace the parent ones instead of
            // merging, so every page has to carry the complete social set.
            openGraph: {
                type: "website",
                siteName: SITE_NAME,
                url: canonical,
                title: socialTitle,
                description,
                locale: OPEN_GRAPH_LOCALES[currentLocale],
                alternateLocale: routing.locales
                    .filter(l => l !== currentLocale)
                    .map(l => OPEN_GRAPH_LOCALES[l]),
                images: socialImages,
            },
            twitter: {
                card: "summary_large_image",
                title: socialTitle,
                description,
                images: socialImages,
            },
            robots: isIndexable
                ? { index: true, follow: true }
                : { index: false, follow: false },
        };
    }
}
