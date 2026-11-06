"use client";

import { ChangeEvent, useContext, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import s from "./style.module.scss";
import { ShopContext } from "../../../../context/shop.context";
import { MainBtn } from "@/components";
import { cn } from "@/helpers";
import { tinyFive } from "@/fonts/fonts";

type PriceRangeType = {
    minPrice: number;
    maxPrice: number;
}

const MIN_PRICE = 0;
const MAX_PRICE = 500;
const STEP = 5;

export const PriceRange = ({
    onApply
}: {
    /** Called after the range is applied, e.g. to close a sheet. */
    onApply?: ()=> void;
})=> {
    const t = useTranslations();
    const format = useFormatter();

    const { 
        goodFilterParams,
        setGoodFilterParams 
    } = useContext(ShopContext);

    const [priceRange, setPriceRange] 
        = useState<PriceRangeType>({
            minPrice: goodFilterParams.min_price ?? MIN_PRICE, 
            maxPrice: goodFilterParams.max_price ?? MAX_PRICE
        });

    const {minPrice, maxPrice} = priceRange;

    const minPercent =
        ((minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    const maxPercent =
        ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

    // The slider moves in whole euros, so no fraction digits are shown.
    const formatPrice = (value: number)=> format.number(value, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    });

    const handleFormSubmit = ()=> {
        setGoodFilterParams(p => ({
            ...p,
            min_price: minPrice,
            max_price: maxPrice,
        }));
        onApply?.();
    };

    const handleMinInputChange = (
        e: ChangeEvent<HTMLInputElement>
    )=> {
        const value = Number(e.target.value);

        setPriceRange(p => ({
            ...p,
            minPrice: Math.min(value, maxPrice - (STEP * 43))
        }));
    };

    const handleMaxInputChange = (
        e: ChangeEvent<HTMLInputElement>
    )=> {
        const value = Number(e.target.value);

        setPriceRange(p => ({
            ...p,
            maxPrice: Math.max(value, minPrice + (STEP * 43))
        }));
    };

    return (
        <article
            className={s.price_range}
        >
            <div className={cn(
                s.price_range__values,
                tinyFive.className
            )}>
                <span
                    className={s.price}
                    style={{
                        left: `${minPercent}%`,
                    }}
                >
                    {formatPrice(minPrice)}
                </span>
                <span
                    className={s.price}
                    style={{
                        right: `${100 - maxPercent}%`,
                    }}
                >
                    {formatPrice(maxPrice)}
                </span>
            </div>

            <form 
                className={s.price_range__slider}
                action={handleFormSubmit}
            >
                <div 
                    className={s.price_range__track} 
                />

                <div
                    className={s.price_range__active}
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                    }}
                />

                <input 
                    type="range"
                    step={STEP}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={minPrice}
                    aria-label={t("catalog.priceRange.minLabel")}
                    onChange={handleMinInputChange}
                    className={s.price_range__input}
                />

                <input 
                    type="range"
                    step={STEP}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={maxPrice}
                    aria-label={t("catalog.priceRange.maxLabel")}
                    onChange={handleMaxInputChange}
                    className={s.price_range__input}
                />
            </form>
            
            <div className="pt-5">
                <MainBtn
                    className="w-full"
                    onClick={handleFormSubmit}
                >
                    {t("common.actions.apply")}
                </MainBtn>
            </div>
        </article>
    )
}
