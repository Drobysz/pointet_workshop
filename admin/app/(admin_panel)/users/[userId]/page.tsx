import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { UserDetailView } from "./_sections/UserDetailView/UserDetailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("userDetail") };
}

export default async function UserDetailPage({
  params,
}: PageProps<"/users/[userId]">) {
  const { userId } = await params;

  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <UserDetailView userId={userId} />
    </Suspense>
  );
}
