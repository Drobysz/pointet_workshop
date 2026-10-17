import { requestBackend } from "@/helpers";
import type {
  ApiCollection,
  ApiList,
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
): Promise<ApiCollection<T> | ApiList<T>> {
  const encodedSearch = encodeURIComponent(search);

  if (kind === "categories") {
    return requestBackend<ApiList<T>>(`/categories?search=${encodedSearch}`);
  }

  const endpoint = `/${kind}?page=${page}&per_page=7&search=${encodedSearch}`;

  return requestBackend<ApiCollection<T>>(endpoint);
}

export function getAllCategories(): Promise<ApiList<Category>> {
  return requestBackend<ApiList<Category>>("/categories");
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
