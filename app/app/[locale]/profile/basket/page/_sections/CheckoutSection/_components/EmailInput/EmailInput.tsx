import { DecoInput } from "@/components";
import { inter_regular, jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";

export const EmailInput = ({
    error,
    setEmail
}: {
    error : string | null;
    setEmail: Dispatch<SetStateAction<string>>;
})=> {
    const t = useTranslations("checkout.email");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        setEmail(e.target.value);
    };

    return (
        <label className="flex gap-3 items-center max-md:flex-wrap">
            <span className={cn(
                jersey10.className,
                "text-2xl pl-2 flex items-center gap-1"
            )}>
                
                <span>
                    {t("label")}
                </span>
            </span>

            <DecoInput
                className="max-w-50 max-md:max-w-none max-md:flex-1"
                type="email"
                name="email"
                onChange={handleChange}
            />

            {error && 
                    <span className={cn(
                        inter_regular.className,
                        "text-red-600"
                    )}>
                        {error}
                    </span>
                }
        </label>
    )
}