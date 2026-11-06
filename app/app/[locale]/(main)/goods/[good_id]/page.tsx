import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache, Suspense } from "react";
import { categoryApi } from "@/api/api";
import { ApiError } from "@/api/core/ApiError";
import { Good } from "@/api/types/goods";
import { CentralizedProgressLoading, JsonLd } from "@/components";
import { SeoService, StructuredDataService } from "@/helpers";
import { PageView } from "./page/PageView";
import { GoodContextProvider } from "./context/good.context";

interface GoodPageProps {
    params: Promise<{ locale: string; good_id: string }>;
}

/**
 * Shared by `generateMetadata` and the page, so a product is requested
 * once per render. Unknown products resolve to the 404 page.
 */
const getGood = cache(async (goodId: string): Promise<Good> => {
    const id = Number(goodId);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    try {
        const { data } = await categoryApi.getGood(id);

        return data;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            notFound();
        }

        throw error;
    }
});

export async function generateStaticParams() {
    const goods = await categoryApi.getAllGoods();

    return goods.map((good) => ({
        good_id: String(good.id)
    }));
}

export async function generateMetadata({
    params
}: GoodPageProps): Promise<Metadata> {
    const { locale, good_id } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    const t = await getTranslations({
        locale: currentLocale,
        namespace: "seo.product",
    });
    const good = await getGood(good_id);

    return SeoService.getPageMetadata({
        locale,
        pathname: `/goods/${good.id}`,
        title: `${good.name} — ${good.brand}`,
        description: SeoService.truncateDescription(
            good.description || t("fallbackDescription", {
                name: good.name,
                brand: good.brand,
            })
        ),
        images: StructuredDataService.getGoodImages(good).slice(0, 4),
    });
}

export default async function GoodPage({
    params
}: GoodPageProps) {
    const { locale, good_id } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    const t = await getTranslations("seo.breadcrumbs");
    const good = await getGood(good_id);

    return (
        <GoodContextProvider
            good={good}
        >
            <JsonLd
                data={[
                    StructuredDataService.getProduct(good, locale),
                    StructuredDataService.getBreadcrumbs([
                        {
                            name: t("home"),
                            path: SeoService.getLocalizedPath(locale, "/home"),
                        },
                        {
                            name: t("shop"),
                            path: SeoService.getLocalizedPath(locale, "/shop"),
                        },
                        {
                            name: good.name,
                            path: SeoService.getLocalizedPath(
                                locale, `/goods/${good.id}`
                            ),
                        },
                    ]),
                ]}
            />
            <Suspense 
                fallback={
                    <CentralizedProgressLoading />
                }
            >
                <PageView 
                    good={good}
                />
            </Suspense>
        </GoodContextProvider>
    )
}
