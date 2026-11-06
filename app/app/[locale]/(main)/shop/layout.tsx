import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categoryApi } from "@/api/api";
import { CentralizedProgressLoading, JsonLd } from "@/components";
import { SeoService, StructuredDataService } from "@/helpers";
import { ReactNode, Suspense } from "react";
import { ShopContextProvider } from "./context/shop.context";
import s from "./layout.module.scss";
import {
    CategoryAsideMenu,
    SortParamsSection,
} from "./layout_components"

interface ShopLayoutProps {
    params: Promise<{ locale: string }>;
}

// The shop page itself is a Client Component, so its metadata lives here.
export async function generateMetadata({
    params
}: ShopLayoutProps): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.shop",
    });

    return SeoService.getPageMetadata({
        locale,
        pathname: "/shop",
        title: t("title"),
        description: t("description"),
    });
}

export default async function ShopLayout({
    children,
    params
}: Readonly<ShopLayoutProps & {
    children: ReactNode;
}>) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    const t = await getTranslations("catalog");
    const tBreadcrumbs = await getTranslations("seo.breadcrumbs");
    const { data: categories } = await categoryApi.getCategories();

    return (
        <>
            <JsonLd
                data={StructuredDataService.getBreadcrumbs([
                    {
                        name: tBreadcrumbs("home"),
                        path: SeoService.getLocalizedPath(locale, "/home"),
                    },
                    {
                        name: tBreadcrumbs("shop"),
                        path: SeoService.getLocalizedPath(locale, "/shop"),
                    },
                ])}
            />
            {/* The catalog is rendered on the client, so the page heading
                is emitted here to be part of the prerendered HTML. */}
            <h1 className="sr-only">
                {t("heading")}
            </h1>
            {/* The provider reads `useSearchParams`: it needs a Suspense boundary. */}
            <Suspense fallback={<CentralizedProgressLoading />}>
                <ShopContextProvider
                    categories={categories}
                >
                    <div className={s.shop_grid_container}>
                        <CategoryAsideMenu 
                            className={s.aside_menu}
                        />
                        <div className={s.good_side_container}>
                            <SortParamsSection />
                            <div>
                                {children}
                            </div>
                        </div>
                    </div>
                </ShopContextProvider>
            </Suspense>
        </>
    )
}
