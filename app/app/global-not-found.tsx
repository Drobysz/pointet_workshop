import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import "./[locale]/globals.css";
import { routing } from "@/i18n/routing";
import { cn, SITE_NAME } from "@/helpers";
import { inter_regular, sixCaps, tinyFive } from "@/fonts/fonts";

// These URLs carry no locale, so the default language is used.
const locale = routing.defaultLocale;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "seo.notFound" });

    return {
        title: `${t("title")} | ${SITE_NAME}`,
        description: t("description"),
    };
}

/**
 * Served for URLs that match no route at all (they never reach the
 * locale layout), so it renders a complete, self-contained document.
 */
export default async function GlobalNotFound() {
    const t = await getTranslations({ locale, namespace: "notFound" });

    return (
        <html lang={locale}>
            <body className={cn(inter_regular.className, "bg-gray-100")}>
                <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
                    <p
                        className={cn(
                            sixCaps.className,
                            "text-[160px] leading-[0.9] text-red-400 sm:text-[220px]"
                        )}
                        aria-hidden="true"
                    >
                        404
                    </p>
                    <h1 className="text-2xl font-semibold text-zinc-700">
                        {t("title")}
                    </h1>
                    <p className="max-w-md text-zinc-500">
                        {t("globalDescription")}
                    </p>
                    <a
                        className={cn(
                            tinyFive.className,
                            "rounded-xl bg-zinc-700 px-4 py-2.5 text-lg text-white"
                        )}
                        href={`/${locale}/home`}
                    >
                        {t("backHome")}
                    </a>
                </main>
            </body>
        </html>
    )
}
