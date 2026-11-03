import { queryString, requestBackend } from "@/helpers";
import type { ApiCollection, ApiEntity, Preorder, PreorderAnalyticsItem } from "@/interface/domain";

export function getPreorders(page: number, search: string, paymentStatus?: string) {
  return requestBackend<ApiCollection<Preorder>>(`/preorders?${queryString({ page, search, payment_status: paymentStatus, per_page: 20 })}`);
}

export function getPreorder(id: number) {
  return requestBackend<ApiEntity<Preorder>>(`/preorders/${id}`);
}

export function getPreorderAnalytics(page: number) {
  return requestBackend<ApiCollection<PreorderAnalyticsItem>>(`/preorder/analytics?${queryString({ page, per_page: 20 })}`);
}
