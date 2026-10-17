"use client";

import { Good } from "@/api/types/goods"
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after } from "@/fonts/fonts";
import {
    TitleHeader,
    GoodOptions,
    GoodParams,
} from "./_components";
import { Divider } from "@/components";

export const GoodInfo = ({
    good,
}: {
    good: Good;
})=> {
    return (
        <section className={s.good_info_section}>
            <TitleHeader 
                goodName={good.name}
                categoryName={good.category.name}
                subcategoryName={good.subcategory.name}
            />

            <GoodOptions 
                good={good}
            />

            <Divider />

            <GoodParams 
                good={good}
            />

            <Divider />

            <p className={cn(
                s.desc,
                after.className
            )}>
                {good.description}
            </p>
        </section>
    )
}
