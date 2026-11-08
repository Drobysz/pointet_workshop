"use client";

import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import s from "./style.module.scss";
import { Loading } from "./_components";

import { 
    PreorderList,
    ErrorTitle,
} from "./_sections";

export function OrdersView() {
    const { 
        preOrdersList, 
        isPreOrdersLoading, 
        preOrdersError 
    } = useContext(GlobalContext);

    const isEmpty = 
        (preOrdersList ?? false) &&
        (preOrdersList ?? []).length < 1;

    return (
        <div className={s.orders_page}>
            {(isPreOrdersLoading || preOrdersError || isEmpty) &&
                <ErrorTitle 
                    isLoading={isPreOrdersLoading}
                    error={preOrdersError}
                    isEmpty={isEmpty}
                />
            }
            <ul className={s.orders_list}>
                {preOrdersList && 
                    <PreorderList 
                        preOrdersList={preOrdersList}
                    />
                }
                {isPreOrdersLoading && <Loading />}
            </ul>
        </div>
    );
}
