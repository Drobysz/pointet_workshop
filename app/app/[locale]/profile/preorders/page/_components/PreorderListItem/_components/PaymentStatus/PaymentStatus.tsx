import { PreorderPaymentStatus } from "@/api/types/preorder"
import { cn } from "@/helpers";
import { useTranslations } from "next-intl";

export const PaymentStatus = ({
    payment_status
}: {
    payment_status: PreorderPaymentStatus;
})=> {
    const t = useTranslations("preorders.status");

    return (
        <span className={cn(
            "px-2 text-lg rounded-lg bg-gray-100", {
                ["bg-green-100 text-green-700"]: payment_status === "paid",
                ["bg-red-100 text-red-700"]: payment_status === "failed",
            }
        )}>
            {t(payment_status)}
        </span>
    )
}
