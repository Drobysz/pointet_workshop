import { AuthenticatedResponse } from "../types/auth";
import { ApiError, ApiErrorResponse } from "./ApiError";

export class ApiClient {
    private refreshPromise: Promise<AuthenticatedResponse> | null = null;

    constructor (
        protected readonly baseUrl: string,
    ) {}

    protected async request<T>(
        endpoint: string,
        options: RequestInit = {},
        canRetry: boolean = false,
    ): Promise<T> {
        const res = await fetch(
            `${this.baseUrl}${endpoint}`,
            {
                ...options,
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    ...this.localeHeaders(),
                    ...options.headers,
                }
            }
        );

        if (!res.ok) {
            const shouldRefresh =
                res.status === 401 &&
                endpoint !== "/auth/refresh" &&
                canRetry;

            if (!shouldRefresh) {
                throw await this.createApiError(res);
            }

            const authStatus = await this.getReshreshPromise();

            if (!authStatus.data.authenticated) {
                throw await this.createApiError(res);
            }

            return await this.request(
                endpoint,
                options
            );
        }

        if (res.status === 204 || 
            res.status === 205
        ) {
            return undefined as T;
        }

        return res.json();
    }

    /**
     * Catalog labels (product, category, color and material names) are
     * returned in the requested language. In the browser the `<html lang>`
     * set by the locale layout is used; server components pass the locale
     * explicitly through the per-request headers.
     */
    private localeHeaders(): Record<string, string> {
        if (typeof document === "undefined") {
            return {};
        }

        const locale = document.documentElement.lang;

        return locale ? { "Accept-Language": locale } : {};
    }

    private async getReshreshPromise(): Promise<AuthenticatedResponse> {
        if (!this.refreshPromise) {
            this.refreshPromise = this.refresh();
        }

        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    private async createApiError (
        res: Response
    ): Promise<ApiError> {
        let data: ApiErrorResponse | null = null;

        try {
            data = await res.json();
        } catch {
            // 
        }

        const message = data?.message ??
            `API request failed with status ${res.status}`;

        return new ApiError(
            res.status,
            message,
            data?.errors,
        );
    }

    private async refresh (): Promise<AuthenticatedResponse> {
        return await this.request<AuthenticatedResponse>(
            "/auth/refresh", 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            },
            false
        );
    }

    public get<T>(
        endpoint: string,
        canRetry: boolean = true,
    ): Promise<T> {
        return this.request<T>(
            endpoint, 
            { method: "GET" },
            canRetry,
        );
    }

    public post<T>(
        endpoint: string,
        body?: unknown,
        canRetry: boolean = true
    ): Promise<T> {
        return this.request<T>(
            endpoint, 
            {
                method: "POST",
                body: JSON.stringify(body),
            },
            canRetry
        );
    }
}
