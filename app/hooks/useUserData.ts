import { basketApi, guestBasketApi, ordersApi, preorderApi } from '@/api/api';
import useSWR from 'swr';
import { useLocale } from 'next-intl';
import { BasketItem, BasketListResponse } from '@/api/types/basket';
import { Order, OrderListResponse } from '@/api/types/orders';
import { AuthStatus } from '@/app/[locale]/context/global.interface';
import { Preorder, PreorderListResponse } from '@/api/types/preorder';

export type UserDataType = keyof UserDataMap;
export type UserDataMap = {
    preOrders: PreorderListResponse;
    orders: OrderListResponse;
    basket: BasketListResponse;
};
export type UserDataReturnMap = {
    preOrders: Preorder[];
    orders: Order[];
    basket: BasketItem[];
};

export const useUserData = <T extends UserDataType>(
    type: T, 
    authStatus: AuthStatus
)=> {
    // Basket and order lines carry localized product names.
    const locale = useLocale();
    const authRequestLibrary: {
        [K in UserDataType]: ()=> Promise<UserDataMap[K]>
    } = {
        preOrders: () => preorderApi.getPreorders(),
        orders: () => ordersApi.getOrders(),
        basket: () => basketApi.getBasket(),
    };

    const nonAuthRequestLibrary: {
        [K in UserDataType]: ()=> Promise<UserDataMap[K]>
    } = {
        preOrders: () => preorderApi.getGuestPreorders(),
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
        authStatus === "loading" ? null : [type, authStatus, locale],
        userDataRequest,
        {
            refreshInterval: 10 * 60 * 1000,
            dedupingInterval: 10 * 60 * 1000,
        }
    );
}
