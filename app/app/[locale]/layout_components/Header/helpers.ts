export interface HeaderPage {
    /** Key of the page name below `navigation.pages`. */
    labelKey: "about" | "shop" | "sellers";
    href: string;
}

/** Main site sections, shared by the desktop and the mobile navigation. */
export const headerPages: HeaderPage[] = [
    { labelKey: "about", href: "/home" },
    { labelKey: "shop", href: "/shop" },
    { labelKey: "sellers", href: "/sellers" },
];
