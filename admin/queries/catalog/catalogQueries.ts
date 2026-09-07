import { queryString, requestBackend } from "@/helpers";
import type {
  ApiCollection,
  ApiEntity,
  Category,
  Color,
  Good,
  GoodPayload,
  Material,
  ProductStatistics,
} from "@/interface/domain";

export function getGoods(page: number, search: string) {
  const query = queryString({ page, search, per_page: 7 });
  return requestBackend<ApiCollection<Good>>(`/goods?${query}`);
}

export function getGood(id: string | number) {
  return requestBackend<ApiEntity<Good>>(`/goods/${id}`);
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
  const [categoryResponse, colorResponse, materialResponse] = await Promise.all([
    requestBackend<ApiCollection<Category>>("/categories?per_page=100"),
    requestBackend<ApiCollection<Color>>("/colors?per_page=100"),
    requestBackend<ApiCollection<Material>>("/materials?per_page=100"),
  ]);

  return {
    categories: categoryResponse.data,
    colors: colorResponse.data,
    materials: materialResponse.data,
  };
}

export function getProductStatistics(id: string) {
  return requestBackend<ApiEntity<ProductStatistics>>(
    `/goods/${id}/statistics`,
  );
}
