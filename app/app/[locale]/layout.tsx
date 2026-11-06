import type { Metadata, Viewport } from "next";
import "./globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  PageTransition,
  BlurWrapper,
  Header,
  Footer,
} from "./layout_components/index";
import LayoutOverlays from "./layout_components/LayoutLayers/LayoutLayers";
import { inter_regular } from "@/fonts/fonts";
import s from "./layout_components/layout_style.module.scss";
import {
  cn,
  SeoService,
  SITE_NAME,
} from "@/helpers";
import { GlobalContextProvider } from "./context/global.context";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f4f6",
  colorScheme: "light",
};

/**
 * Site-wide defaults. Canonical and hreflang links are deliberately
 * absent: they are inherited by nested routes, so each page declares
 * its own through `SeoService.getPageMetadata`.
 */
export async function generateMetadata({
  params
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = SeoService.resolveLocale(locale);
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "seo.site",
  });
  const defaultTitle = `${SITE_NAME} — ${t("tagline")}`;
  const description = t("description");
  const images = [SeoService.getDefaultImage(currentLocale)];

  return {
    metadataBase: new URL(SeoService.getSiteUrl()),
    title: {
      default: defaultTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: defaultTitle,
      description,
      locale: SeoService.getOpenGraphLocale(currentLocale),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params
}: Readonly<LocaleParams & {
  children: ReactNode;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering of the localized routes.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
    >
        <body className={cn(
          inter_regular.className,
          "bg-gray-100"
        )}>
          <NextIntlClientProvider
            locale={locale}
          >
            <GlobalContextProvider>
              <LayoutOverlays />
              {/* <PageTransition> */}
                <BlurWrapper>
                  <div className={s.wrapper}>
                    <Header />
                    {children}
                    <Footer />
                  </div>
                </BlurWrapper>
              {/* </PageTransition> */}
            </GlobalContextProvider>
          </NextIntlClientProvider>
        </body>
    </html>
  );
}
