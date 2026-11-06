import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductDetailView } from "./_sections/ProductDetailView/ProductDetailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("productDetail") };
}

export default async function ProductPage({
  params,
}: PageProps<"/goods/[goodId]">) {
  const { goodId } = await params;
  return <ProductDetailView goodId={goodId} />;
}
