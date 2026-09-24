import { ApiClient } from "./ApiClient";

export class PublicApiClient extends ApiClient {
    public get<T>(endpoint: string) {
        return this.request<T>(endpoint);
    }

    public post<T>(
        endpoint: string,
        body?: unknown
    ) {
        return this.request<T>(
            endpoint,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );
    }
}
