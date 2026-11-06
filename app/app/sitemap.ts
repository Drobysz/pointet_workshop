import type { MetadataRoute } from "next";
import { categoryApi } from "@/api/api";
import { SeoService } from "@/helpers";
import { routing } from "@/i18n/routing";

type SitemapEntry = MetadataRoute.Sitemap[number];

interface SitemapRoute {
    pathname: string;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
    lastModified?: Date;
}

// Products are added through the admin panel: refresh the sitemap hourly.
export const revalidate = 3600;

const STATIC_ROUTES: SitemapRoute[] = [
    { pathname: "/home", changeFrequency: "weekly", priority: 1 },
    { pathname: "/shop", changeFrequency: "daily", priority: 0.9 },
    { pathname: "/sellers", changeFrequency: "monthly", priority: 0.6 },
    { pathname: "/docs/privacy_policy", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/cookies_policy", changeFrequency: "yearly", priority: 0.2 },
];

async function getGoodRoutes(): Promise<SitemapRoute[]> {
    try {
        const goods = await categoryApi.getAllGoods();

        return goods.map((good) => ({
            pathname: `/goods/${good.id}`,
            changeFrequency: "weekly",
            priority: 0.8,
            ...(good.created_at && {
                lastModified: new Date(good.created_at),
            }),
        }));
    } catch {
        // An unreachable API must not break the sitemap of static pages.
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = [
        ...STATIC_ROUTES,
        ...await getGoodRoutes(),
    ];

    // One entry per locale, each cross-linked with its hreflang alternates.
    return routes.flatMap(({ pathname, ...route }) => {
        const languages = SeoService.getLanguageAlternates(pathname);

        return routing.locales.map((locale) => ({
            ...route,
            url: languages[locale],
            alternates: { languages },
        }));
    });
}
