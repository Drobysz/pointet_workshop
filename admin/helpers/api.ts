import type { ApiErrorBody } from "@/interface/domain";

export class ApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL ?? "http://localhost:8000/api";
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "/api";
}

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return response.ok;
}

function createRequestHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function parseApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  const code = body.error?.code ?? "request_failed";

  return new ApiError(response.status, code);
}

export async function requestBackend<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = createRequestHeaders(init);
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401 && retry && path !== "/auth/refresh") {
    refreshing ??= refreshSession().finally(() => {
      refreshing = null;
    });

    if (await refreshing) {
      return requestBackend<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function queryString(
  values: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}
