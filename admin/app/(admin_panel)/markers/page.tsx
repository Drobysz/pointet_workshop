import type { Metadata } from "next";
import { Suspense } from "react";
import { StatePanel } from "@/components";
import { MarkersView } from "./_sections/MarkersView/MarkersView";

export const metadata: Metadata = { title: "Référentiels" };

export default function MarkersPage() {
  return (
    <Suspense fallback={<StatePanel state="loading" />}>
      <MarkersView />
    </Suspense>
  );
}
