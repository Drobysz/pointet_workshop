import { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import {
    SmoothScrollContextProvider
} from "./smooth_scroll_context/SmoothScroll";
import {
    ScrollToTopBtn,
} from "./layout_components/index";

export default async function HomeLayout ({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <SmoothScrollContextProvider>
            {children}
            <ScrollToTopBtn />
        </SmoothScrollContextProvider>
    )
}
