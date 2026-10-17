import { basketApi, ordersApi } from '@/api/api';
import useSWR from 'swr';
import { BasketItem, BasketListResponse } from '@/api/types/basket';
import { Order, OrderListResponse } from '@/api/types/orders';
import { CookiesService } from '@/helpers';

export type UserDataType = keyof UserDataMap;
export type UserDataMap = {
    orders: OrderListResponse;
    basket: BasketListResponse;
};
export type UserDataReturnMap = {
    orders: Order[];
    basket: BasketItem[];
};

export const useUserData = <T extends UserDataType>(type: T)=> {
    const requestLibrary: {
        [K in UserDataType]: ()=> Promise<UserDataMap[K]>
    } = {
        orders: ordersApi.getOrders,
        basket: basketApi.getBasket,
    };

    const userDataRequest = async ()=> {
        const requestObject = requestLibrary[type];
        const response = await requestObject();

        if (!response.data) {
            const cookies = new CookiesService();
            const cookie = cookies.getCookies(`pointet-${type}`);

            if (cookie) {
                return JSON.parse(cookie);
            }
        }
        
        return response.data;
    }

    return useSWR<UserDataReturnMap[T]>(
        type,
        userDataRequest,
        {
            refreshInterval: 10 * 60 * 1000,
            dedupingInterval: 10 * 60 * 1000,
        }
    );
}
