/** Keys of translated footer link labels below the `navigation` namespace. */
export type FooterLabelKey =
    | "pages.shop"
    | "pages.sellers"
    | "footer.links.privacyPolicy";

/**
 * A row is either translated (`labelKey`) or shown as is (`text`):
 * e-mail addresses and social network names are not translated.
 */
export type RowLink = {
    link?: string;
} & (
    | { labelKey: FooterLabelKey }
    | { text: string }
);

export type LinkColumn = {
    /** Key of the column title below `navigation.footer.columns`. */
    titleKey: "support" | "navigation" | "social";
    rows: RowLink[];
}

export type DocLink = {
    /** Key of the document name below `navigation.footer.legal`. */
    labelKey:
        | "documents"
        | "privacyPolicy";
    link: string;
}
