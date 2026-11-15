import { queryString, requestBackend } from "@/helpers";
import type { ApiEntity, ApiList, Order, OrderStatus, OrderTrackingLink } from "@/interface/domain";

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

export function addOrderTrackingLink(orderId: number, trackingUrl: string) {
  return requestBackend<ApiEntity<OrderTrackingLink>>(`/orders/${orderId}/tracking-links`, {
    method: "POST",
    body: JSON.stringify({ tracking_url: trackingUrl }),
  });
}

export function updateOrderStatus(orderId: number, status: OrderStatus) {
  return requestBackend<ApiEntity<Order>>(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
