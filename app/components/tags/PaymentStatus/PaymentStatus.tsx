import { OrderStatus } from "@/api/types/orders";
import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";
import { useTranslations } from "next-intl";

export const PaymentStatus = ({
    payment_status
}: {
    payment_status: OrderStatus;
})=> {
    const t = useTranslations("orders.status");

    return (
        <span className={cn(
            "px-2 text-lg h-fit rounded-lg bg-gray-100", {
                ["bg-blue-100 text-blue-700"]: payment_status === "sent",
                ["bg-yellow-100 text-yellow-700"]: payment_status === "processing",
                ["bg-red-100 text-red-700"]: ["reported", "cancelled"].includes(payment_status),
            },
            jersey10.className
        )}>
            {t(payment_status)}
        </span>
    )
}
