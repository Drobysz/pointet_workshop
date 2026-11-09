import { ApiClient } from "./ApiClient";

export class PublicApiClient extends ApiClient {
    public get<T>(
        endpoint: string,
        canRetry: boolean = false,
        headers?: Record<string, string>,
    ) {
        return this.request<T>(
            endpoint,
            headers ? { method: "GET", headers } : { method: "GET" },
            canRetry,
        );
    }

    public post<T>(
        endpoint: string,
        body?: unknown,
    ) {
        return this.request<T>(
            endpoint,
            {
                method: "POST",
                body: JSON.stringify(body),
            },
            false
        );
    }
}
