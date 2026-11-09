import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { fontVariables } from "@/fonts/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f4f6",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const login = await getTranslations("login");
  const t = await getTranslations("metadata");
  const appName = login("heading");

  return {
    title: {
      default: appName,
      template: `%s · ${appName}`,
    },
    description: t("description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
