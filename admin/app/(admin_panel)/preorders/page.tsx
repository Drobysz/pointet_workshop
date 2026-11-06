import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PreordersView } from "./_sections/PreordersView/PreordersView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preorders");

  return { title: t("title") };
}

export default function PreordersPage() {
  return <PreordersView />;
}
