export type RowLink = {
    label: string;
    link?: string;
}

export type LinkColumn = {
    label: string;
    rows: RowLink[];
}