import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { AdminsView } from "./_sections/AdminsView/AdminsView";

export const metadata: Metadata = { title: "Administrateurs" };

export default function AdminsPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <AdminsView />
    </Suspense>
  );
}
