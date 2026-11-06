import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/helpers";
import { climate_crisis, sixCaps, tinyFive } from "@/fonts/fonts";
import s from "./not-found.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("seo.notFound");

    return {
        title: t("title"),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function NotFound() {
    const t = await getTranslations("notFound");

    return (
        <main className={s.wrapper}>
            <section className={s.window}>
                <p
                    className={cn(s.code, sixCaps.className)}
                    aria-hidden="true"
                >
                    404
                </p>
                <h1 className={cn(s.title, climate_crisis.className)}>
                    {t("title")}
                </h1>
                <p className={s.description}>
                    {t("description")}
                </p>
                <nav
                    className={cn(s.links, tinyFive.className)}
                    aria-label={t("linksLabel")}
                >
                    <Link className={s.link} href="/home">
                        {t("backHome")}
                    </Link>
                    <Link className={s.link} href="/shop">
                        {t("openShop")}
                    </Link>
                </nav>
            </section>
        </main>
    )
}
