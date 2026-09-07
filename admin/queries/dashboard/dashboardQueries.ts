import { requestBackend } from "@/helpers";
import type {
  AnalyticsPoint,
  ApiEntity,
  DashboardSummary,
  Order,
  TopProduct,
} from "@/interface/domain";

export function getSummary() {
  return requestBackend<ApiEntity<DashboardSummary>>("/dashboard/summary");
}

export function getAnalytics(range: string) {
  return requestBackend<ApiEntity<AnalyticsPoint[]>>(
    `/dashboard/analytics?range=${range}`,
  );
}

export function getTopProducts() {
  return requestBackend<ApiEntity<TopProduct[]>>("/dashboard/top-products");
}

export function getLatestOrders() {
  return requestBackend<{ data: Order[] }>("/dashboard/latest-orders");
}
