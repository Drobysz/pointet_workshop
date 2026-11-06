import { PrivateApiClient } from "./core/PrivateApiClient";
import { PublicApiClient } from "./core/PublicApiClient";
import {
    UserApi,
    AuthApi,
    BasketApi,
    GuestBasketApi,
    CategoryApi,
    OrdersApi,
    PreorderApi,
    StripeApi,
    SellerApi,
} from "./services";

const BASE_URL = typeof window === "undefined"
    ? process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error("base url is not defined");
}

export const publicApiClient = new PublicApiClient(BASE_URL);
export const privateApiClient = new PrivateApiClient(BASE_URL);

export const authApi = new AuthApi(
    publicApiClient,
    privateApiClient
);
export const userApi = new UserApi(privateApiClient);
export const basketApi = new BasketApi(privateApiClient);
export const guestBasketApi = new GuestBasketApi(publicApiClient);
export const categoryApi = new CategoryApi(publicApiClient);
export const ordersApi = new OrdersApi(privateApiClient, publicApiClient);
export const preorderApi = new PreorderApi(privateApiClient, publicApiClient);
export const stripeApi = new StripeApi(publicApiClient);
export const sellerApi = new SellerApi(publicApiClient);
