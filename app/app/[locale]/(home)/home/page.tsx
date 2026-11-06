import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components";
import {
  SeoService,
  StructuredDataService,
  SITE_NAME,
} from "@/helpers";
import { PageView } from "./PageView/PageView";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = SeoService.resolveLocale(locale);
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "seo.site",
  });

  return SeoService.getPageMetadata({
    locale,
    pathname: "/home",
    title: `${SITE_NAME} — ${t("tagline")}`,
    description: t("description"),
    isTitleAbsolute: true,
  });
}

export default async function HomePage({
  params
}: HomePageProps) {
  const { locale } = await params;
  const currentLocale = SeoService.resolveLocale(locale);
  setRequestLocale(currentLocale);
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "seo.site",
  });

  return (
    <>
      <JsonLd
        data={[
          StructuredDataService.getOrganization(t("description")),
          StructuredDataService.getWebsite(locale),
        ]}
      />
      <PageView />
    </>
  );
}
