import { Id } from "@/api/types/api";
import { jersey10, tinyFive } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { useTranslations } from "next-intl";

export const OrderNumber = ({
    preorderId
}: {
    preorderId: Id;
})=> {
    const t = useTranslations("preorders.fields");

    return (
        <div className="text-xl flex gap-2 items-center">
            <span className={cn(
                tinyFive.className,
                "text-zinc-600"
            )}>
                {t("number")}
            </span>

            <span className={cn(
                jersey10.className,
                "text-2xl"
            )}>
                {preorderId}
            </span>
        </div>
    )
}
