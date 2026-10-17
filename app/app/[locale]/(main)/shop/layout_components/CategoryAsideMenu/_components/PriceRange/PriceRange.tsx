"use client";

import { ChangeEvent, useContext, useState } from "react";
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

export const PriceRange = ()=> {
    const { setGoodFilterParams } = useContext(ShopContext);

    const [priceRange, setPriceRange] 
        = useState<PriceRangeType>({
            minPrice: 0, 
            maxPrice: 500
        });

    const {minPrice, maxPrice} = priceRange;

    const minPercent =
        ((minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    const maxPercent =
        ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

    const handleFormSubmit = ()=> {
        setGoodFilterParams(p => ({
            ...p,
            min_price: minPrice,
            max_price: maxPrice,
        }));
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
                    {minPrice} €
                </span>
                <span
                    className={s.price}
                    style={{
                        right: `${100 - maxPercent}%`,
                    }}
                >
                    {maxPrice} €
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
                    onChange={handleMinInputChange}
                    className={s.price_range__input}
                />

                <input 
                    type="range"
                    step={STEP}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={maxPrice}
                    onChange={handleMaxInputChange}
                    className={s.price_range__input}
                />
            </form>
            
            <div className="pt-5">
                <MainBtn
                    className="w-full"
                    onClick={handleFormSubmit}
                >
                    Apply
                </MainBtn>
            </div>
        </article>
    )
}
