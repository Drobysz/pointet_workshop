"use client";

import { ShadowBorderWindow } from "../ShadowBorderWindow/ShadowBorderWindow";
import PurseIcon from "@/assets/purse.svg";
import { MainBtn } from "../../buttons/MainBtn/MainBtn";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { basketErrorMessages } from "@/api/core/errorMessages";
import { basketApi } from "@/api/api";
import { LocalBasketService } from "@/helpers/basket";
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
        setNotification
    } = useContext(GlobalContext);

    const router = useRouter();
    const [isBasketPending, setIsBasketPending] = useState(false);

    const handleBasketBtnClick = async ()=> {
        setIsBasketPending(true);

        if (quantity <= 0 
            && 
            currentInventoryId !== null
        ) {
            setNotification({
                status: "alert",
                text: "You should choose size and quantity!"
            });
            setIsBasketPending(false);
            return ;
        }

        const requestData: BasketCreateRequest = {
            good_register_id: currentInventoryId,
            quantity: quantity
        };

        LocalBasketService.update(requestData);

        const goodNarrowedName = goodName.length > 15 
            ? goodName.slice(0, 15) 
            : goodName;
        const message 
            = `Your item "${goodNarrowedName}..." was added to basket`;

        if (authStatus === "unauthenficated") {
            setNotification({
                status: "success",
                text: message
            });
            setIsBasketPending(false);
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
                className="h-fit"
            >
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
                            {`${price} €`}
                        </span>
                    </div>

                    <div className={s.checkout_window__btns_container}>
                        <MainBtn
                            className="w-full"
                            onClick={handleBasketBtnClick}
                        >
                            {!isBasketPending 
                                ? "🛒 Add to basket"
                                : <CircularProgress 
                                    color="inherit"
                                    size={10}
                                />
                            }
                        </MainBtn>
                        <button
                            className={cn(
                                s.checkout_window__buy_btn,
                                tinyFive.className
                            )}
                        >
                            Buy now
                        </button>
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
                    {"back"}
                </span>
            </button>
        </div>
    )
}
