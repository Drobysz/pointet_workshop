import { jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { CircularProgress } from "@mui/material"
import { useTranslations } from "next-intl";

export const ErrorTitle = ({
    isLoading,
    error,
    isEmpty
}: {
    isLoading: boolean
    error : Error | undefined
    isEmpty: boolean;
})=> {
    const t = useTranslations();

    return (
        <div className="h-[70vh] flex items-center justify-center">
            {isLoading && 
                <CircularProgress
                    size={30}
                    color="inherit"
                />
            }
            {(error || isEmpty) &&
                <h2 className={cn(
                    jersey10.className,
                    "text-3xl",
                    "max-sm:text-2xl"
                )}>
                    {error && t("common.states.loadFailed")}
                    {isEmpty && t("preorders.list.empty")}
                </h2>
            }
        </div>
    )
}
