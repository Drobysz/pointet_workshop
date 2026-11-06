import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "../../style.module.scss";
import { EmailInput } from "../EmailInput/EmailInput";
import { Dispatch, SetStateAction } from "react";
import { useFormatter, useTranslations } from "next-intl";

export const CheckoutInfo = ({
    isGuest,
    error,
    setEmail,
}: {
    isGuest: boolean;
    error : string | null;
    setEmail: Dispatch<SetStateAction<string>>;
})=> {
    const t = useTranslations();
    const format = useFormatter();

    return (
        <>
            <div className="flex gap-8 items-center max-md:flex-col max-md:items-stretch max-md:gap-2">
                <div className={cn(
                    s.checkout_sect__total_price,
                    jersey10.className
                )}>
                    <span>
                        {t("basket.summary.total")}
                    </span>

                    <span>
                        {format.number(1, { style: "currency", currency: "EUR" })}
                    </span>
                </div>

                {isGuest &&
                    <EmailInput
                        setEmail={setEmail}
                        error={error}
                    />
                }
            </div>

            <p className={s.checkout_sect__disclosure}>
                {t("checkout.disclosure")}
            </p>
        </>
    )
}
