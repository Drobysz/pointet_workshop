import { jersey10 } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "../../style.module.scss";
import { ChangeEvent, Dispatch, SetStateAction, useContext } from "react";
import { useTranslations } from "next-intl";
import { BasketFormError, BasketRequestData } from "../../formScheme/BasketFormScheme";
import { Input } from "@/components";
import { inputType } from "@/components/inputs/Input/Input.props";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { SlidingNumber } from "@/components/animations/SlidingNumber/SlidingNumber";

export const CheckoutInfo = ({
    isGuest,
    errors,
    basketRequestData,
    setBasketRequestData,
}: {
    isGuest: boolean; 
    errors : BasketFormError | null;
    basketRequestData: BasketRequestData,
    setBasketRequestData: Dispatch<SetStateAction<BasketRequestData>>;
})=> {
    const {
        basketList,
        basketError,
        isBasketLoading
    } = useContext(GlobalContext);

    const totalPrice = (basketList ?? [])
        .reduce(
            (acc, item)=> 
                acc 
                + 
                (item.quantity * Number(item.good.price)), 
                0
        );
    const brandQuantity = (new Set(
        (basketList ?? [])
        .map(item => item.good.brand)
    )).size;

    const deliveryCost = 15 * brandQuantity;

    const totalPriceWithDelivery = totalPrice + deliveryCost;

    const t = useTranslations();
    const basketForms = [
        { label: t("checkout.form.email"), type: "email", name: "email", placeholder: "test@example.com" },
        { label: t("checkout.form.fullName"), type: "text", name: "full_name", placeholder: "Alex Drobysz" },
        { label: t("checkout.form.address"), type: "text", name: "address", placeholder: t("auth.fields.addressPlaceholder") },
    ];

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setBasketRequestData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <div className="
                flex gap-2 
                items-stretch 
                flex-col
                "
            >
                <div className={cn(
                    s.checkout_sect__total_price,
                    jersey10.className
                )}>
                    <span>
                        {t("basket.summary.total")}
                    </span>

                    <span>
                        {(basketError || isBasketLoading)
                            ? t("basket.summary.unknown")
                            : <SlidingNumber 
                                value={totalPriceWithDelivery}
                              />
                        }
                        €
                    </span>
                </div>


                <div className={s.checkout_sect__form_grid}>
                    {isGuest && basketForms.map(item=>
                        <Input
                            className="bg-gray-100! rounded-2xl!"
                            key={`basket-form-${item.label}`}       
                            type={item.type as inputType}
                            label={item.label}
                            name={item.name}
                            placeholder={item.placeholder}
                            value={basketRequestData[item.name as keyof BasketRequestData] ?? ""}
                            onChange={handleChange}
                            error={errors?.[item.name as keyof BasketFormError]?.[0]}
                        />
                    )}
                </div>
            </div>

            <span className={cn(
                jersey10.className,
                "text-xl pl-3 leading-3"
            )}>
                {t("checkout.delivery", { cost: deliveryCost })}
            </span>

            <p className={s.checkout_sect__disclosure}>
                {t("checkout.disclosure")}
            </p>
        </>
    )
}
