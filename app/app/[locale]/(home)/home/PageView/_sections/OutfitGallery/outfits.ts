export interface Outfit {
    src: string;
    /** One-based number used in the image description. */
    number: number;
}

export const OUTFITS: Outfit[] = Array.from({ length: 12 }, (_, index) => ({
    src: `/outfit/example${index + 1}.jpg`,
    number: index + 1,
}));
