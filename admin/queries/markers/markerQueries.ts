import { requestBackend } from "@/helpers";
import type {
  ApiCollection,
  Category,
  Color,
  Material,
  Subcategory,
} from "@/interface/domain";

export type MarkerKind = "categories" | "subcategories" | "colors" | "materials";
export type Marker = Category | Subcategory | Color | Material;

export function getMarkers<T extends Marker>(
  kind: MarkerKind,
  page: number,
  search: string,
) {
  const encodedSearch = encodeURIComponent(search);
  const endpoint = `/${kind}?page=${page}&per_page=7&search=${encodedSearch}`;

  return requestBackend<ApiCollection<T>>(endpoint);
}

export async function getAllCategories() {
  const first = await requestBackend<ApiCollection<Category>>("/categories?per_page=100");
  const data = [...first.data];
  for (let page = 2; page <= first.meta.last_page; page++) {
    const next = await requestBackend<ApiCollection<Category>>(`/categories?per_page=100&page=${page}`);
    data.push(...next.data);
  }
  return { ...first, data };
}

export function getMarkerOptions(kind: "colors" | "materials", page: number, search: string) {
  return requestBackend<ApiCollection<Color | Material>>(`/${kind}?per_page=50&page=${page}&search=${encodeURIComponent(search)}`);
}

export function createMarker<T extends Marker>(
  kind: MarkerKind,
  data: Record<string, string | number> | FormData,
) {
  return requestBackend<{ data: T }>(`/${kind}`, {
    method: "POST",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export function updateMarker<T extends Marker>(
  kind: MarkerKind,
  id: number,
  data: Record<string, string | number> | FormData,
) {
  if (data instanceof FormData) data.set("_method", "PUT");
  return requestBackend<{ data: T }>(`/${kind}/${id}`, {
    method: data instanceof FormData ? "POST" : "PUT",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export function deleteMarker(kind: MarkerKind, id: number) {
  return requestBackend<void>(`/${kind}/${id}`, { method: "DELETE" });
}
