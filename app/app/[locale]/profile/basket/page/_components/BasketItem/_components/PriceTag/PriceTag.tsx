import Purse from "@/assets/purse.svg";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { useFormatter } from "next-intl";

export const PriceTag = ({
    price,
    multiplicator
}: {
    price: number;
    multiplicator: number;
})=> {
    const format = useFormatter();

    return (
        <div className={s.price_tag}>
            <Purse />
            <span className={cn(
                s.price_tag__price_with_euro,
                jersey10.className
            )}>
                <span className={s.price_tag__number}>
                    {format.number(multiplicator * price, { maximumFractionDigits: 2 })}
                </span>

                <span className={cn(
                    s.price_tag__euro,
                    tinyFive.className
                )}>
                    €
                </span>
            </span>
        </div>
    )
}
