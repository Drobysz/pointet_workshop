import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { SideMenu } from "./layout/index";
import s from "./layout/GridLayout.module.scss";

export default async function DocsLayout ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    setRequestLocale(SeoService.resolveLocale(locale));

    return (
        <div className={s.wrapper}>
            <SideMenu 
                className={s.aside}
            />
            <section className={s.page}>
                {children}
            </section>
        </div>
    )
}
