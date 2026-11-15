import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { useLocale, useTranslations } from "next-intl";

export const OrderDate = ({
    created_at
}: {
    created_at: string;
})=> {
    const t = useTranslations("preorders.list");
    const locale = useLocale();

    const date = new Date(created_at ?? 0);

    const dateString = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
    const time = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

    return (
        <div className={cn(
            "flex gap-2 items-center text-2xl",
            jersey10.className
        )}>
            {t.rich("purchasedAt", {
                date: dateString,
                time,
                muted: (chunks) => (
                    <span className={"text-zinc-500"}>
                        {chunks}
                    </span>
                ),
                value: (chunks) => (
                    <span>
                        {chunks}
                    </span>
                ),
            })}
        </div>
    )
}
