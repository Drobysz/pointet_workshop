export class ApiClient {
    constructor (
        protected readonly baseUrl: string,
    ) {}

    protected async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const res = await fetch(
            `${this.baseUrl}${endpoint}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                }
            }
        );

        if (!res.ok) {
            throw new Error(
                `API request Failed status: ${res.status}`
            );
        }

        const data = await res.json() as T;
        return data;
    }

    public get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: "GET",
        });
    }

    public post<T>(
        endpoint: string,
        body?: unknown,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }
}
