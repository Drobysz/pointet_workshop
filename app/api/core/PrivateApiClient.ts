import { ApiClient } from "./ApiClient";

export class PrivateApiClient extends ApiClient {
    protected override request<T>(
        endpoint: string,
        options: RequestInit = {},
        canRetry: boolean = true,
    ): Promise<T> {
        return super.request<T>(
            endpoint,
            {
                ...options,
                "credentials": "include",
            },
            canRetry,
        );
    }

    public patch<T>(
        endpoint: string,
        body: unknown,
        canRetry: boolean = true,
    ): Promise<T> {
        return this.request<T>(
            endpoint, 
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
            canRetry,
        );
    }

    public delete<T>(
        endpoint: string,
        canRetry: boolean = true,
    ): Promise<T> {
        return this.request<T>(
            endpoint, 
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            },
            canRetry,
        );
    }
}
