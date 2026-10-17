import { AuthenticatedResponse } from "../types/auth";
import { ApiError, ApiErrorResponse } from "./ApiError";

export class ApiClient {
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
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
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

            const authStatus = await this.refresh();

            if (!authStatus.data.authenticated) {
                throw await this.createApiError(res);
            }

            return await this.request(
                endpoint,
                options
            );
        }

        return res.json();
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
            "/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
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
