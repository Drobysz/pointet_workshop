import type { Metadata } from "next";
import { SellerApplicationsView } from "./_sections/SellerApplicationsView/SellerApplicationsView";

export const metadata: Metadata = { title: "Candidatures vendeurs" };

export default function SellerApplicationsPage() {
  return <SellerApplicationsView />;
}
