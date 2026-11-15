"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import s from "./style.module.scss";
import { Loading } from "./_components";

import { 
    OrderList,
    ErrorTitle,
} from "./_sections";

export function OrdersView() {
    const { 
        ordersList, 
        isOrdersLoading, 
        ordersError 
    } = useContext(GlobalContext);

    const isEmpty = 
        (ordersList ?? false) &&
        (ordersList ?? []).length < 1;

    return (
        <div className={s.orders_page}>
            {(isOrdersLoading || ordersError || isEmpty) &&
                <ErrorTitle 
                    isLoading={isOrdersLoading}
                    error={ordersError}
                    isEmpty={isEmpty}
                />
            }
            <ul className={s.orders_list}>
                {ordersList && 
                    <OrderList 
                        ordersList={ordersList}
                    />
                }
                {isOrdersLoading && <Loading />}
            </ul>
        </div>
    );
}
