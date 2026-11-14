import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { categoryApi } from "@/api/api";
import { SeoService } from "@/helpers";
import { routing } from "@/i18n/routing";

type SitemapEntry = MetadataRoute.Sitemap[number];

interface SitemapRoute {
    pathname: string;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
    lastModified?: SitemapEntry["lastModified"];
}

const STATIC_ROUTES: SitemapRoute[] = [
    { pathname: "/home", changeFrequency: "weekly", priority: 1 },
    { pathname: "/shop", changeFrequency: "daily", priority: 0.9 },
    { pathname: "/sellers", changeFrequency: "monthly", priority: 0.6 },
    { pathname: "/docs/legal_notice", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/privacy_policy", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/cookies_policy", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/refund_policy", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/seller_policy", changeFrequency: "yearly", priority: 0.2 },
    { pathname: "/docs/seller_rules", changeFrequency: "yearly", priority: 0.2 },
];

const getGoodRoutes = unstable_cache(async (): Promise<SitemapRoute[]> => {
    const goods = await categoryApi.getAllGoods();

    return goods.map((good) => ({
        pathname: `/goods/${good.id}`,
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: good.created_at || undefined,
    }));
}, ["sitemap-goods"], { revalidate: 3600 });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connection();
    // An unreachable API must not break the sitemap of static pages.
    const goods = await getGoodRoutes().catch(() => []);
    const routes = [...STATIC_ROUTES, ...goods];

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
