import { PrivateApiClient } from "../core/PrivateApiClient";
import { PublicApiClient } from "../core/PublicApiClient";
import { Id } from "../types/api";
import { 
    PreorderCheckoutSessionResponse, 
    PreorderCreateRequest, 
    PreorderListParams, 
    PreorderListResponse, 
    PreorderResponse, 
    PreorderUpdateRequest 
} from "../types/preorder";

export class PreorderApi {
    constructor(
        private readonly api: PrivateApiClient, 
        private readonly publicApi: PublicApiClient
    ) {}

    public createPreorder(data: PreorderCreateRequest): Promise<PreorderCheckoutSessionResponse> {
        return this.publicApi.post<PreorderCheckoutSessionResponse>("/preorders", data);
    }

    public getPreorders(params: PreorderListParams = {}): Promise<PreorderListResponse> {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                query.set(key, String(value));
            }
        });

        return this.api.get<PreorderListResponse>(`/preorders?${query}`);
    }

    public getGuestPreorders(params: Pick<PreorderListParams, "per_page"> = {}): Promise<PreorderListResponse> {
        const query = params.per_page 
            ? `?per_page=${params.per_page}` 
            : "";
        return this.publicApi.get<PreorderListResponse>(`/preorders/guest${query}`);
    }

    public getPreorder(id: Id): Promise<PreorderResponse> {
        return this.api.get<PreorderResponse>(`/preorders/${id}`);
    }

    public updatePreorder(id: Id, data: PreorderUpdateRequest): Promise<PreorderResponse> {
        return this.api.patch<PreorderResponse>(`/preorders/${id}`, data);
    }

    public deletePreorder(id: Id): Promise<void> {
        return this.api.delete<void>(`/preorders/${id}`);
    }
}
