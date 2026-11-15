"use client";

import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import s from "./style.module.scss";

import {
    OrderNumber,
    OrderDate,
} from "./_components";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Order } from "@/api/types/orders";
import { PaymentStatus } from "@/components";

export const OrderListItem = ({
    order
}: {
    order: Order
})=> {
    const t = useTranslations("preorders.list");
    const router = useRouter();

    const handleClick = ()=> {
        router.push(`/profile/orders/${order.id}`);
    }

    return (
        <li 
            className={s.preorder_list_item}
            onClick={handleClick}
        >
            <div className={s.first_half}>
                <OrderNumber
                    preorderId={order.id}
                />
                {order.placed_at &&
                    <OrderDate 
                        created_at={order.placed_at}
                    />
                }
                
            </div>

            <div className={cn(
                s.second_half,
                jersey10.className
            )}>
                <span className="text-2xl text-zinc-600">
                    {t("quantity", { count: order.quantity })}
                </span>

                <span className="text-2xl text-zinc-600">
                    {t("total", {
                        price: `${order.total}€`,
                    })}
                </span>

                <PaymentStatus
                    payment_status={order.status}
                />
            </div>
        </li>
    )
}
