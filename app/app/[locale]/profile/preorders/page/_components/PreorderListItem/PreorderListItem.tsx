"use client";

import { Preorder } from "@/api/types/preorder"
import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import s from "./style.module.scss";

import {
    OrderNumber,
    OrderDate,
    PaymentStatus,
} from "./_components";
import { useRouter } from "@/i18n/navigation";
import { useFormatter, useTranslations } from "next-intl";

export const PreorderListItem = ({
    preorder
}: {
    preorder: Preorder
})=> {
    const t = useTranslations("preorders.list");
    const format = useFormatter();
    const router = useRouter();

    const quantity = 
        (preorder.registers ?? [])
            .reduce((acc, val)=> 
                acc + val.quantity, 0
            );
    const formattedPrice 
        = preorder.payment_amount_cents / 100;

    const handleClick = ()=> {
        router.push(`/profile/preorders/${preorder.id}`);
    }

    return (
        <li 
            className={s.preorder_list_item}
            onClick={handleClick}
        >
            <div className={s.first_half}>
                <OrderNumber 
                    preorderId={preorder.id}
                />
                {preorder.created_at &&
                    <OrderDate 
                        created_at={preorder.created_at}
                    />
                }
                
            </div>

            <div className={cn(
                s.second_half,
                jersey10.className
            )}>
                <span className="text-2xl text-zinc-600">
                    {t("quantity", { count: quantity })}
                </span>

                <span className="text-2xl text-zinc-600">
                    {t("total", {
                        price: format.number(formattedPrice, {
                            style: "currency",
                            currency: "EUR",
                        }),
                    })}
                </span>

                <PaymentStatus 
                    payment_status={preorder.payment_status}
                />
            </div>
        </li>
    )
}
