import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderDetailView } from "./_sections/OrderDetailView/OrderDetailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("orderDetail") };
}

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  return <OrderDetailView orderId={orderId} />;
}
