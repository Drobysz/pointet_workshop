"use client";

import { Good } from "@/api/types/goods";
import s from "./style.module.scss";
import {
    ImageSlider,
    CheckoutWindow,
} from "@/components";
import { GoodInfo } from "./_components/GoodInfo/GoodInfo";
import { useContext } from "react";
import { GoodContext } from "../context/good.context";

export const PageView = ({
    good
}: {
    good: Good;
}) => {
    const { 
        currentColor,
        currentInventoryId,
        currentQuantity,

        setCurrentQuantity,
    } = useContext(GoodContext);

    return (
        <div
            className={s.good_page}
        >
            <ImageSlider
                isLarge
                goodId={good.id}
                goodName={good.name}
                images={currentColor.images}
            />
            <GoodInfo 
                good={good}
            />
            <CheckoutWindow
                price={good.price}
                goodName={good.name}
                quantity={currentQuantity}
                currentInventoryId={currentInventoryId ?? 0}
                setCurrentQuantity={setCurrentQuantity}
            />
        </div>
    )
}
