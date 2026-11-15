import { PublicApiClient } from "../core/PublicApiClient";
import { OrderCheckoutSessionResponse } from "../types/orders";
import { PreorderCheckoutSessionResponse } from "../types/preorder";

export type CheckoutSessionResponse =
    | PreorderCheckoutSessionResponse
    | OrderCheckoutSessionResponse;

export class StripeApi {
    constructor(private readonly api: PublicApiClient) {}

    public getCheckoutSession(sessionId: string): Promise<CheckoutSessionResponse> {
        return this.api.get<CheckoutSessionResponse>(
            `/stripe/checkout-sessions/${encodeURIComponent(sessionId)}`,
        );
    }
}
