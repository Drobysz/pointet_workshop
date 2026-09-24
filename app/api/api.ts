import { PrivateApiClient } from "./core/PrivateApiClient";
import { PublicApiClient } from "./core/PublicApiClient";
import { UserApi } from "./services/UserApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error("base url is not defined");
}

export const publicApiClient = new PublicApiClient(BASE_URL);
export const privateApiClient = new PrivateApiClient(BASE_URL);

export const userApi = new UserApi(privateApiClient);
