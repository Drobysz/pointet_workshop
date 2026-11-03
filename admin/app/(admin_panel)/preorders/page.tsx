import type { Metadata } from "next";
import { PreordersView } from "./_sections/PreordersView/PreordersView";

export const metadata: Metadata = { title: "Précommandes" };

export default function PreordersPage() {
  return <PreordersView />;
}
