import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { UsersTable } from "./_sections/UsersTable/UsersTable";

export const metadata: Metadata = { title: "Utilisateurs" };

export default function UsersPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <UsersTable />
    </Suspense>
  );
}
