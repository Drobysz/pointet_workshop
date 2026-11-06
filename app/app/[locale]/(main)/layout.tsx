import { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import s from "./layout.module.scss";

export default async function MainLayout({
    children,
    params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <main className={s.wrapper}>
            <div className={s.main}>
                {children}
            </div>
        </main>
    )
}
