"use client";

import { ShadowBorderWindow } from "../ShadowBorderWindow/ShadowBorderWindow";
import PurseIcon from "@/assets/purse.svg";
import { MainBtn } from "../../buttons/MainBtn/MainBtn";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useContext, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CircularProgress } from "@mui/material";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { basketErrorMessages } from "@/api/core/errorMessages";
import { basketApi, guestBasketApi } from "@/api/api";
import { BasketCreateRequest } from "@/api/types/basket";

export const CheckoutWindow = ({
    price,
    currentInventoryId,
    quantity,
    goodName,
}: {
    price: string;
    currentInventoryId: number;
    quantity: number;
    goodName: string;
})=> {
    const { 
        authStatus,
        setNotification,
        mutateBasket,
    } = useContext(GlobalContext);

    const t = useTranslations();
    const format = useFormatter();

    const router = useRouter();
    const [isBasketPending, setIsBasketPending] = useState(false);

    const outputPrice = quantity > 0 
        ? Number(price) * quantity 
        : price;

    const handleBasketBtnClick = async ()=> {
        setIsBasketPending(true);

        if (quantity <= 0 
            && 
            currentInventoryId !== null
        ) {
            setNotification({
                status: "alert",
                text: t("product.notifications.chooseSizeAndQuantity")
            });
            setIsBasketPending(false);
            return ;
        }

        const requestData: BasketCreateRequest = {
            good_register_id: currentInventoryId,
            quantity: quantity
        };

        const goodNarrowedName = goodName.length > 15 
            ? goodName.slice(0, 15) 
            : goodName;
        const message = t("product.notifications.addedToBasket", {
            name: goodNarrowedName
        });

        if (authStatus === "unauthenficated") {
            try {
                await guestBasketApi.addItem(requestData);
                await mutateBasket();
                setNotification({ status: "success", text: message });
            } catch (error) {
                setNotification({ status: "error", text: getApiErrorMessage(error, t, basketErrorMessages.addItem) });
            } finally {
                setIsBasketPending(false);
            }
            return ;
        }
        
        try {
            await basketApi.addItem(requestData);

            setNotification({
                status: "success",
                text: message
            });
        } catch (error) {
            setNotification({
                status: "error",
                text: getApiErrorMessage(
                    error,
                    t,
                    basketErrorMessages.addItem
                )
            });
        } finally {
            setIsBasketPending(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <ShadowBorderWindow
                withoutCross
                withoutGradient
                className="h-fit max-lg:w-full"
            >
                {/* Total price */}
                <div
                    className={s.checkout_window}
                >
                    <div className={s.checkout_window__price_container}>
                        <PurseIcon 
                            className="-translate-y-0.5"
                        />

                        <span
                            className={cn(
                                s.checkout_window__price,
                                jersey10.className
                            )}
                        >
                            {format.number(Number(outputPrice), {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </span>
                    </div>

                    {/* Checkout buttons */}
                    <div className={s.checkout_window__btns_container}>
                        <MainBtn
                            className="w-full"
                            onClick={handleBasketBtnClick}
                        >
                            {!isBasketPending 
                                ? `🛒 ${t("product.actions.addToBasket")}`
                                : <CircularProgress 
                                    color="inherit"
                                    size={10}
                                />
                            }
                        </MainBtn>

                        {/* <button
                            className={cn(
                                s.checkout_window__buy_btn,
                                tinyFive.className
                            )}
                        >
                            Buy now
                        </button> */}
                    </div>
                </div>
            </ShadowBorderWindow>

            <button 
                className={cn(
                    s.back_btn,
                    jersey10.className
                )}

                onClick={()=> router.back()}
            >
                <ArrowLeft
                    className="w-4.5 h-4.5"
                />
                <span>
                    {t("product.actions.goBack")}
                </span>
            </button>
        </div>
    )
}
