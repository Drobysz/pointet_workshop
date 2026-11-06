import { Good } from "@/api/types/goods";
import { SeoService, SITE_NAME } from "./seo";

export type JsonLdData = Record<string, unknown>;

export interface BreadcrumbItem {
    name: string;
    /** Locale-aware, root-relative path, e.g. "/en/shop". */
    path: string;
}

const SCHEMA_CONTEXT = "https://schema.org";

export class StructuredDataService {
    /** `description` is the localized `seo.site.description` message. */
    static getOrganization(description: string): JsonLdData {
        const siteUrl = SeoService.getSiteUrl();

        return {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: SITE_NAME,
            url: siteUrl,
            description,
        };
    }

    static getWebsite(locale: string): JsonLdData {
        const siteUrl = SeoService.getSiteUrl();

        return {
            "@context": SCHEMA_CONTEXT,
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: SITE_NAME,
            url: SeoService.getAbsoluteUrl(
                SeoService.getLocalizedPath(locale, "/home")
            ),
            inLanguage: locale,
            publisher: { "@id": `${siteUrl}/#organization` },
        };
    }

    static getBreadcrumbs(items: BreadcrumbItem[]): JsonLdData {
        return {
            "@context": SCHEMA_CONTEXT,
            "@type": "BreadcrumbList",
            itemListElement: items.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                item: SeoService.getAbsoluteUrl(item.path),
            })),
        };
    }

    static getProduct(good: Good, locale: string): JsonLdData {
        const url = SeoService.getAbsoluteUrl(
            SeoService.getLocalizedPath(locale, `/goods/${good.id}`)
        );
        const images = StructuredDataService.getGoodImages(good);

        return {
            "@context": SCHEMA_CONTEXT,
            "@type": "Product",
            "@id": `${url}#product`,
            name: good.name,
            description: good.description,
            sku: String(good.id),
            category: good.subcategory?.name ?? good.category?.name,
            brand: {
                "@type": "Brand",
                name: good.brand,
            },
            ...(images.length > 0 && { image: images }),
            ...(good.colors.length > 0 && {
                color: good.colors.map(color => color.name).join(", "),
            }),
            ...(good.materials.length > 0 && {
                material: good.materials
                    .map(material => material.name)
                    .join(", "),
            }),
            offers: {
                "@type": "Offer",
                url,
                price: good.price,
                priceCurrency: "EUR",
                availability: good.current_quantity > 0
                    ? `${SCHEMA_CONTEXT}/InStock`
                    : `${SCHEMA_CONTEXT}/PreOrder`,
                seller: { "@id": `${SeoService.getSiteUrl()}/#organization` },
            },
        };
    }

    /** Permanent URLs of every product image, ordered as in the gallery. */
    static getGoodImages(good: Good): string[] {
        return good.colors
            .flatMap(color => color.images)
            .map(image => image.url)
            .filter((url): url is string => Boolean(url))
            .map(SeoService.getStableAssetUrl);
    }
}
