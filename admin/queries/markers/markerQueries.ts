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

export function getAllCategories() {
  return requestBackend<ApiCollection<Category>>("/categories?per_page=100");
}

export function createMarker<T extends Marker>(
  kind: MarkerKind,
  data: Record<string, string | number>,
) {
  return requestBackend<{ data: T }>(`/${kind}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMarker<T extends Marker>(
  kind: MarkerKind,
  id: number,
  data: Record<string, string | number>,
) {
  return requestBackend<{ data: T }>(`/${kind}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMarker(kind: MarkerKind, id: number) {
  return requestBackend<void>(`/${kind}/${id}`, { method: "DELETE" });
}
