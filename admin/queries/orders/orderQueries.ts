import { queryString, requestBackend } from "@/helpers";
import type { ApiCollection, ApiEntity, Order } from "@/interface/domain";

export function getOrders(page: number, search: string, userId?: string) {
  const query = queryString({
    page,
    search,
    user_id: userId,
    per_page: 7,
  });

  return requestBackend<ApiCollection<Order>>(`/orders?${query}`);
}

export function getOrder(id: string) {
  return requestBackend<ApiEntity<Order>>(`/orders/${id}`);
}
