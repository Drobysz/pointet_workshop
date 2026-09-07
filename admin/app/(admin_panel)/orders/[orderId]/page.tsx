import type { Metadata } from "next";
import { OrderDetailView } from "./_sections/OrderDetailView/OrderDetailView";

export const metadata: Metadata = { title: "Détail de la commande" };

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  return <OrderDetailView orderId={orderId} />;
}
