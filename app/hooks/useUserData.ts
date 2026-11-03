import { basketApi, guestBasketApi, ordersApi } from '@/api/api';
import useSWR from 'swr';
import { BasketItem, BasketListResponse } from '@/api/types/basket';
import { Order, OrderListResponse } from '@/api/types/orders';
import { AuthStatus } from '@/app/[locale]/context/global.interface';

export type UserDataType = keyof UserDataMap;
export type UserDataMap = {
    orders: OrderListResponse;
    basket: BasketListResponse;
};
export type UserDataReturnMap = {
    orders: Order[];
    basket: BasketItem[];
};

export const useUserData = <T extends UserDataType>(
    type: T, 
    authStatus: AuthStatus
)=> {
    const authRequestLibrary: {
        [K in UserDataType]: ()=> Promise<UserDataMap[K]>
    } = {
        orders: () => ordersApi.getOrders(),
        basket: () => basketApi.getBasket(),
    };

    const nonAuthRequestLibrary: {
        [K in UserDataType]: ()=> Promise<UserDataMap[K]>
    } = {
        orders: () => ordersApi.getGuestOrders(),
        basket: () => guestBasketApi.getBasket(),
    };

    const userDataRequest = async ()=> {
        const requestObject = authStatus === "authenficated"
            ? authRequestLibrary[type]
            : nonAuthRequestLibrary[type];
        const response = await requestObject();
        return response.data as UserDataReturnMap[T];
    }

    return useSWR<UserDataReturnMap[T]>(
        authStatus === "loading" ? null : [type, authStatus],
        userDataRequest,
        {
            refreshInterval: 10 * 60 * 1000,
            dedupingInterval: 10 * 60 * 1000,
        }
    );
}
