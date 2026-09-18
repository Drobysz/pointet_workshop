import type { Metadata } from "next";
import "./globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
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

export const metadata: Metadata = {
  title: "Pointet Workshop",
  description: "Workshop of Pointet Family",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({ 
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
    >
        <body className={inter_regular.className}>
          <NextIntlClientProvider
            locale={locale}
          >
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
          </NextIntlClientProvider>
        </body>
    </html>
  );
}
