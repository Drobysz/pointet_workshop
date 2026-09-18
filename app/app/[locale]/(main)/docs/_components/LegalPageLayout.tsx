import type { ReactNode } from "react";
import s from "./legal.module.scss";
import content from "./content.json";

type LegalPageLayoutProps = {
    title: string;
    lastUpdated: string;
    children: ReactNode;
};

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${lastUpdated}T00:00:00Z`));

    return (
        <article className={s.article} lang="en" aria-labelledby="policy-title">
            <header className={s.header}>
                <h1 id="policy-title" className={s.title}>{title}</h1>
                <p className={s.updated}>
                    {content.lastUpdatedLabel}: <time dateTime={lastUpdated}>{formattedDate}</time>
                </p>
            </header>
            {children}
        </article>
    );
}
