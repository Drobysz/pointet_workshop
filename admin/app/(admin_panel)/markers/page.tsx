import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { MarkersView } from "./_sections/MarkersView/MarkersView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("markers");

  return { title: t("title") };
}

export default function MarkersPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <MarkersView />
    </Suspense>
  );
}
