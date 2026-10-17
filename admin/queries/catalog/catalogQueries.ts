import { queryString, requestBackend } from "@/helpers";
import type {
  ApiCollection,
  ApiEntity,
  Good,
  GoodPayload,
  ProductImage,
  ProductImagePayload,
  ProductStatistics,
} from "@/interface/domain";

export function getGoods(page: number, search: string) {
  const query = queryString({ page, search, per_page: 7 });
  return requestBackend<ApiCollection<Good>>(`/admin/goods?${query}`);
}

export function getGood(id: string | number) {
  return requestBackend<ApiEntity<Good>>(`/admin/goods/${id}`);
}

export function createGood(payload: GoodPayload) {
  return requestBackend<ApiEntity<Good>>("/goods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGood(id: number, payload: GoodPayload) {
  return requestBackend<ApiEntity<Good>>(`/goods/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getCatalogOptions() {
  const { getAllCategories } = await import("../markers/markerQueries");
  const categories = await getAllCategories();
  return { categories: categories.data };
}

export function uploadProductImage(id: number, colorId: number, file: File) {
  const body = new FormData();
  body.set("color_id", String(colorId));
  body.set("image", file);
  return requestBackend(`/goods/${id}/images`, { method: "POST", body });
}

export function updateProductImage(
  imageId: number,
  payload: ProductImagePayload,
) {
  return requestBackend<ApiEntity<ProductImage>>(`/images/${imageId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProductImage(imageId: number) {
  return requestBackend<void>(`/images/${imageId}`, {
    method: "DELETE",
  });
}

export function getProductStatistics(id: string) {
  return requestBackend<ApiEntity<ProductStatistics>>(
    `/goods/${id}/statistics`,
  );
}

export function restockInventory(goodId: number, registerId: number, quantity: number) {
  return requestBackend<ApiEntity<Good>>(`/goods/${goodId}/inventory/${registerId}/restock`, {
    method: "POST", body: JSON.stringify({ quantity }),
  });
}
