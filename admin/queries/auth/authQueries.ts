import { requestBackend } from "@/helpers";
import type { ApiEntity, User } from "@/interface/domain";

interface LoginResponse {
  data: {
    user: User;
    authenticated: boolean;
  };
}

export function login(credentials: { email: string; password: string }) {
  return requestBackend<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logout() {
  return requestBackend("/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return requestBackend<ApiEntity<User>>("/auth/me");
}

export function verifyAccount(token: string) {
  return requestBackend("/account/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
