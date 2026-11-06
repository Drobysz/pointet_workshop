import type { PublicApiClient } from "../core/PublicApiClient";
import type { SellerRequestResponse, SellerRequestType } from "../types/seller";

export class SellerApi {
    constructor(private readonly api: PublicApiClient) {}

    public createRequest(data: SellerRequestType): Promise<SellerRequestResponse> {
        return this.api.post<SellerRequestResponse>("/seller/requests", data);
    }
}
