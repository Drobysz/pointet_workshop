import type { MetadataRoute } from "next";
import { SeoService } from "@/helpers";

// Private, transactional and technical routes of every locale.
const DISALLOWED_PATHS = [
    "/api/",
    "/*/profile",
    "/*/success",
    "/*/test",
];

export default function robots(): MetadataRoute.Robots {
    const siteUrl = SeoService.getSiteUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: DISALLOWED_PATHS,
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
