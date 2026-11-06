import { Preorder } from "@/api/types/preorder";
import s from "./style.module.scss"
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { useFormatter, useTranslations } from "next-intl";

export const Footer = ({
    preorder
}: {
    preorder: Preorder
})=> {
    const t = useTranslations("preorders.fields");
    const format = useFormatter();

    const quantity =
        (preorder.registers ?? [])
            .reduce(
                (acc, val)=> 
                    acc + val.quantity, 0
            );
    
    const formattedPrice = preorder.payment_amount_cents / 100;

    const entries = [
        { key: t("number"), value: preorder.id },
        { key: t("quantity"), value: quantity },
        {
            key: t("preorderPrice"),
            value: format.number(formattedPrice, {
                style: "currency",
                currency: "EUR",
            }),
        },
    ];

    return (
        <footer
            className={s.preorder_header}
        >
            <div 
                className={s.additional_back}
            />
            {entries.map(({key, value}, idx)=>
                <div
                    key={`order-param-${idx}-${preorder.id}`}
                    className={s.pair}
                >
                    <span className={cn(
                        tinyFive.className,
                        "text-zinc-500 text-2xl"
                    )}>
                        {key}
                    </span>

                    <span className={cn(
                        jersey10.className,
                        "text-zinc-700 text-3xl"
                    )}>
                        {value}
                    </span>   
                </div>
            )}
        </footer>
    )
}
