import Purse from "@/assets/purse.svg";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";

export const PriceTag = ({
    price,
    multiplicator
}: {
    price: number;
    multiplicator: number;
})=> {
    return (
        <div className={s.price_tag}>
            <Purse />
            <span className={cn(
                s.price_tag__price_with_euro,
                jersey10.className
            )}>
                <span className={s.price_tag__number}>
                    {multiplicator * price}
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
