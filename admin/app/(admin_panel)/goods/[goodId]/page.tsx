import type { Metadata } from "next";
import { ProductDetailView } from "./_sections/ProductDetailView/ProductDetailView";

export const metadata: Metadata = { title: "Détail du produit" };

export default async function ProductPage({
  params,
}: PageProps<"/goods/[goodId]">) {
  const { goodId } = await params;
  return <ProductDetailView goodId={goodId} />;
}
