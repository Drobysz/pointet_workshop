"use client";

import { BasketItem } from "@/api/types/basket";
import { useContext, useState } from "react";
import s from "./style.module.scss";
import {
    ParamSection,
    QuantityCounter,
    PriceTag
} from "./_components";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { basketApi, guestBasketApi } from "@/api/api";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { basketErrorMessages } from "@/api/core/errorMessages";
import { useTranslations } from "next-intl";

export const UserBasketItem = ({
    basketItem
}: {
    basketItem: BasketItem;
})=> {
    const t = useTranslations();
    const [quantity, setQuantity] = useState(basketItem.quantity);
    const { 
        authStatus, 
        mutateBasket, 
        setNotification 
    } = useContext(GlobalContext);

    const maxQuantity = basketItem.good.inventory
        .find(inv => inv.id == basketItem.inventory?.id)?.quantity ?? 0;

    const changeQuantity = async (nextQuantity: number) => {
        if (!basketItem.good_register_id || 
            nextQuantity === quantity
        ) return;

        try {
            if (authStatus === "authenficated") {
                if (nextQuantity === 0) {
                    await basketApi.deleteItem(basketItem.id)
                } else {
                    await basketApi.updateItem(
                        basketItem.id, 
                        { quantity: nextQuantity }
                    );
                }
            } else {
                if (nextQuantity === 0) {
                    await guestBasketApi.deleteItem(
                        basketItem.good_register_id
                    );
                }
                else {
                    await guestBasketApi.updateItem(
                        basketItem.good_register_id, 
                        { quantity: nextQuantity }
                    );
                }
            }

            setQuantity(nextQuantity);
            await mutateBasket();
        } catch (error) {
            setNotification({ 
                status: "error", 
                text: getApiErrorMessage(
                    error, 
                    t,
                    basketErrorMessages.addItem
                ) 
            });
        }
    };
    
    return (
        <li className={s.basket_item}>
            <ParamSection 
                basketItem={basketItem}
                onDelete={() => changeQuantity(0)}
            />

            <QuantityCounter 
                maxQuantity={maxQuantity}
                quantity={quantity}
                setQuantity={changeQuantity}
            />

            <PriceTag 
                price={Number(basketItem.good.price)}
                multiplicator={quantity}
            />
        </li>
    )
    
}
