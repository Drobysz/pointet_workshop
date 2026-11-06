import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SellerApplicationsView } from "./_sections/SellerApplicationsView/SellerApplicationsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerApplications");

  return { title: t("title") };
}

export default function SellerApplicationsPage() {
  return <SellerApplicationsView />;
}
