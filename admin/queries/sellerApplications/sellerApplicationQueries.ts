import { queryString, requestBackend } from "@/helpers";
import type { ApiCollection, ApiEntity, SellerApplication, SellerApplicationStatus } from "@/interface/domain";

export function getSellerApplications(page: number, status: SellerApplicationStatus) {
  return requestBackend<ApiCollection<SellerApplication>>(`/seller/requests?${queryString({ page, status, per_page: 20 })}`);
}

export function reviewSellerApplication(id: number, approved: boolean, response: string) {
  return requestBackend<ApiEntity<SellerApplication>>(`/seller/requests/${id}/response`, {
    method: "POST",
    body: JSON.stringify({ approved, response }),
  });
}
