import { setRequestLocale } from "next-intl/server";
import { SeoService } from "@/helpers";
import { redirect } from "@/i18n/navigation";

export default async function DocsPage ({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const currentLocale = SeoService.resolveLocale(locale);
    setRequestLocale(currentLocale);

    redirect({
        href: "/docs/privacy_policy",
        locale: currentLocale
    });
}
