import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { OrdersTable } from "./_sections/OrdersTable/OrdersTable";

export const metadata: Metadata = { title: "Commandes" };

export default function OrdersPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <OrdersTable />
    </Suspense>
  );
}
