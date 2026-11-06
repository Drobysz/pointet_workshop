import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTranslations } from "next-intl/server";
import { SeoService, SITE_NAME } from "@/helpers/seo";

// Static exports cannot be localized, so the alt text is the brand name.
export const alt = SITE_NAME;
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

const LOGO_FONT = "After";

// Default social preview: the brand wordmark on the hero gradient.
export default async function OpenGraphImage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({
        locale: SeoService.resolveLocale(locale),
        namespace: "seo.site",
    });
    const logoFont = await readFile(
        join(process.cwd(), "fonts/after-regular.otf")
    );

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    background:
                        "radial-gradient(circle at center, #ffc9c9 10%, #ff6467 95%)",
                    fontFamily: LOGO_FONT,
                }}
            >
                <div style={{ fontSize: 220, color: "#a74a16" }}>
                    Pointet
                </div>
                <div style={{ fontSize: 44, color: "#ffffff" }}>
                    {t("tagline")}
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: LOGO_FONT,
                    data: logoFont,
                    style: "normal",
                    weight: 400,
                },
            ],
        }
    );
}
