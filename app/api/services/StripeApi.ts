import { PublicApiClient } from "../core/PublicApiClient";
import { PreorderCheckoutSessionResponse } from "../types/preorder";

export class StripeApi {
    constructor(private readonly api: PublicApiClient) {}

    public getCheckoutSession(sessionId: string): Promise<PreorderCheckoutSessionResponse> {
        return this.api.get<PreorderCheckoutSessionResponse>(
            `/stripe/checkout-sessions/${encodeURIComponent(sessionId)}`,
        );
    }
}
