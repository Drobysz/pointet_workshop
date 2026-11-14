/** A run of text inside a paragraph, list item or table cell. */
export type InlineContent = string | {
    text: string;
    /** Root-relative links ("/docs/…") keep the current locale. */
    href?: string;
    strong?: boolean;
};

export type ContentBlock =
    | { paragraph: InlineContent[] }
    | { heading: string }
    | { list: InlineContent[][] }
    | { ordered: InlineContent[][] }
    | { table: { head: InlineContent[][]; rows: InlineContent[][][] } }
    /** Name of a block of `shared.json`, e.g. the operator details. */
    | { shared: string };

export type LegalSectionContent = {
    /** Stable anchor, identical in every language. */
    id: string;
    title: string;
    blocks: ContentBlock[];
};

export type LegalDocument = {
    title: string;
    /** ISO date of the current revision. */
    lastUpdated: string;
    /** Meta description of the page. */
    description: string;
    sections: LegalSectionContent[];
};

export type LegalSharedContent = {
    lastUpdatedLabel: string;
    blocks: Record<string, ContentBlock[]>;
};
