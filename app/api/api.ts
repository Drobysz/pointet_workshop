import { PrivateApiClient } from "./core/PrivateApiClient";
import { PublicApiClient } from "./core/PublicApiClient";
import {
    UserApi,
    AuthApi,
    BasketApi,
    CategoryApi,
    OrdersApi,
} from "./services";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
export const categoryApi = new CategoryApi(publicApiClient);
export const ordersApi = new OrdersApi(privateApiClient);
