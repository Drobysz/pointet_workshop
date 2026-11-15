import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { useTranslations } from "next-intl";

export const FailedToLoad = ()=> {
    const t = useTranslations("preorders.list");

    return (
        <div className="
            w-full h-[80vh] flex 
            justify-center items-center
        ">
            <h2 className={cn(
                jersey10.className,
                "text-5xl text-zinc-700"
            )}>
                {t("loadFailed")}
            </h2>
        </div>
    )
}
