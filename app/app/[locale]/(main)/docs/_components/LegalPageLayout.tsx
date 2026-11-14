import type { ReactNode } from "react";
import type { Locale } from "next-intl";
import s from "./legal.module.scss";

type LegalPageLayoutProps = {
    title: string;
    lastUpdated: string;
    lastUpdatedLabel: string;
    locale: Locale;
    children: ReactNode;
};

export function LegalPageLayout({
    title,
    lastUpdated,
    lastUpdatedLabel,
    locale,
    children,
}: LegalPageLayoutProps) {
    const formattedDate = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${lastUpdated}T00:00:00Z`));

    return (
        <article className={s.article} aria-labelledby="policy-title">
            <header className={s.header}>
                <h1 id="policy-title" className={s.title}>{title}</h1>
                <p className={s.updated}>
                    {lastUpdatedLabel}: <time dateTime={lastUpdated}>{formattedDate}</time>
                </p>
            </header>
            {children}
        </article>
    );
}
