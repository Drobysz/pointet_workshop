import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { GoodsTable } from "./_sections/GoodsTable/GoodsTable";

export const metadata: Metadata = { title: "Produits" };

export default function GoodsPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <GoodsTable />
    </Suspense>
  );
}
