import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { GoodsTable } from "./_sections/GoodsTable/GoodsTable";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("goods");

  return { title: t("title") };
}

export default function GoodsPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <GoodsTable />
    </Suspense>
  );
}
