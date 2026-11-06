import { PreorderRegister } from "@/api/types/preorder"
import s from "./style.module.scss";
import {
    OrderItemImage,
    ProductInfo,
} from "./_components"
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { useFormatter, useTranslations } from "next-intl";

export const RegisterItemList = ({
    registerItems
}: {
    registerItems: PreorderRegister[]
})=> {
    const t = useTranslations("preorders.fields");
    const format = useFormatter();

    return (
        <ul className={s.register_list}>
            {registerItems.map((reg, idx)=> {
                const image = reg.images[0];

                return (
                    <li
                        key={`reg-${reg.id}-${idx}`}
                        className={s.reg_el}
                    >
                        <div className={s.reg_el__first_half}>
                            <OrderItemImage 
                                imageUrl={image.url}
                                productName={reg.product_name}
                            />

                            <ProductInfo 
                                size={reg.size}
                                colorName={reg.color_name}
                                productName={reg.product_name}
                            />
                        </div>

                        <div className={s.reg_el__second_half}>
                            <div className="flex gap-2 items-center">
                                <span className={cn(
                                    tinyFive.className,
                                    s.reg_el__key
                                )}>
                                    {t("quantity")}
                                </span>

                                <span className={cn(
                                    jersey10.className,
                                    s.reg_el__value
                                )}>
                                    {reg.quantity}
                                </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <span className={cn(
                                    tinyFive.className,
                                    s.reg_el__key
                                )}>
                                    {t("price")}
                                </span>
                                
                                <span className={cn(
                                    jersey10.className,
                                    s.reg_el__value
                                )}>
                                    {format.number(
                                        Number(reg.original_unit_price) * reg.quantity,
                                        { style: "currency", currency: "EUR" }
                                    )}
                                </span>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}
