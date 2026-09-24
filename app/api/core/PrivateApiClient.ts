import { ApiClient } from "./ApiClient";

export class PrivateApiClient extends ApiClient {
    protected override request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        return super.request<T>(
            endpoint,
            {
                ...options,
                "credentials": "include",
            }
        );
    }

    public patch<T>(
        endpoint: string,
        body: unknown,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    public delete<T>(
        endpoint: string,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
