import s from "./style.module.scss"
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { useTranslations } from "next-intl";
import { OrderDetail } from "@/api/types/orders";
import { PaymentStatus } from "@/components";
import { Link } from "@/i18n/navigation";
import { SquareArrowOutUpRight } from "lucide-react";
import { UnderlinedInnerLink } from "@/components/animations/UnderlinedLink/UnderlinedInnerLink";

export const Footer = ({
    order
}: {
    order: OrderDetail
})=> {
    const t = useTranslations("preorders.fields");
    const tOrder = useTranslations("orders");

    const quantity =
        (order.items ?? [])
            .reduce(
                (acc, val)=> 
                    acc + val.quantity, 0
            );

    const entries = [
        { key: tOrder("fields.number"), value: order.id },
        { key: t("quantity"), value: quantity },
        {
            key: t("preorderPrice"),
            value: `${order.total} €`,
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
                    key={`order-param-${idx}-${order.id}`}
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
            <PaymentStatus 
                payment_status={order.status}
            />
            {order.tracking_links && 
                order.tracking_links.map((track, idx)=> (
                    <UnderlinedInnerLink
                        key={`tracking-link-${idx}-${order.id}`}
                        href={track.tracking_url}
                    >
                        <span className={cn(
                            jersey10.className,
                            s.tracking_link,
                        )}>
                            {tOrder("trackingLink", { number: idx + 1 })}
                            <SquareArrowOutUpRight />
                        </span>
                    </UnderlinedInnerLink>    
                )
            )}
        </footer>
    )
}
