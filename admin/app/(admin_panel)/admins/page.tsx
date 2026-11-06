import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { AdminsView } from "./_sections/AdminsView/AdminsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admins");

  return { title: t("title") };
}

export default function AdminsPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <AdminsView />
    </Suspense>
  );
}
