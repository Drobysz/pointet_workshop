import { queryString, requestBackend } from "@/helpers";
import type {
  ApiCollection,
  ApiEntity,
  User,
  UserPayload,
} from "@/interface/domain";

export function getUsers(page: number, search: string, role = "user") {
  const query = queryString({ page, search, role, per_page: 7 });
  return requestBackend<ApiCollection<User>>(`/users?${query}`);
}

export function getUser(id: string) {
  return requestBackend<ApiEntity<User>>(`/users/${id}`);
}

export function createUser(payload: UserPayload) {
  return requestBackend<ApiEntity<User>>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: number, payload: UserPayload) {
  return requestBackend<ApiEntity<User>>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createAdmin(
  payload: Required<Pick<UserPayload, "email" | "full_name" | "password">>,
) {
  return requestBackend<ApiEntity<User>>("/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
