import { queryString, requestBackend } from "@/helpers";
import type { ApiEntity, ApiList, Order } from "@/interface/domain";

export function getOrders(search: string, userId?: string) {
  const query = queryString({
    search,
    user_id: userId,
  });

  return requestBackend<ApiList<Order>>(`/orders?${query}`);
}

export function getOrder(id: string) {
  return requestBackend<ApiEntity<Order>>(`/orders/${id}`);
}
