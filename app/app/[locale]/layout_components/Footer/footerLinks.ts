import type { DocLink, LinkColumn } from "./_components/ColumnLinks/types";

export const footerColumnLinks: LinkColumn[] = [
    {
        titleKey: "support",
        rows: [
            {
                text: "support@pointet.fr",
                link: "mailto:alexdrobyszfr@gmail.com",
            },
        ],
    },
    {
        titleKey: "navigation",
        rows: [
            { labelKey: "pages.shop", link: "/shop" },
            { labelKey: "footer.links.privacyPolicy", link: "/docs/privacy_policy" },
            { labelKey: "pages.sellers", link: "/sellers" },
        ],
    },
    {
        titleKey: "social",
        rows: [
            { text: "Instagram", link: "#" },
            { text: "TikTok", link: "#" },
            { text: "WhatsApp", link: "#" },
        ],
    },
];

export const footerDocLinks: DocLink[] = [
    { labelKey: "legalNotice", link: "/docs/legal_notice" },
    { labelKey: "privacyPolicy", link: "/docs/privacy_policy" },
    { labelKey: "cookiesPolicy", link: "/docs/cookies_policy" },
    { labelKey: "refundPolicy", link: "/docs/refund_policy" },
    { labelKey: "sellerPolicy", link: "/docs/seller_policy" },
];
