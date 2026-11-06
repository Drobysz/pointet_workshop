import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { OrdersTable } from "./_sections/OrdersTable/OrdersTable";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");

  return { title: t("title") };
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <OrdersTable />
    </Suspense>
  );
}
