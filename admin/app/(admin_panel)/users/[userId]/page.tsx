import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { UserDetailView } from "./_sections/UserDetailView/UserDetailView";

export const metadata: Metadata = { title: "Détail de l’utilisateur" };

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
