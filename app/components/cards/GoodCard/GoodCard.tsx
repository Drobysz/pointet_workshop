"use client";

import { Good } from "@/api/types/goods"
import { useContext, useEffect, useState } from "react"
import { useTranslations } from "next-intl";
import s from "./style.module.scss";
import {
    ImageSlider,
    Title,
    ColorFeed,
    SizeFeed,
    PriceTag,
    QuantitySelector,
} from "./_components";
import { MainBtn } from "@/components/buttons/MainBtn/MainBtn";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { basketApi, guestBasketApi } from "@/api/api";
import { BasketCreateRequest } from "@/api/types/basket";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { basketErrorMessages } from "@/api/core/errorMessages";
import { CircularProgress } from "@mui/material";

export const GoodCard = ({
    good
}: {
    good: Good
})=> {
    const {
        authStatus,
        mutateBasket,
        setNotification
    } = useContext(GlobalContext);

    const t = useTranslations();

    const [colorId, setColorId] = useState(good.colors[0].id);
    const [currentInventoryId, setCurrentInventoryId] = useState<number | null>(null);
    const [currentQuantity, setCurrentQuantity] = useState(0);
    const [hover, setHover] = useState(false);
    const [isPending, setIsPending] = useState(false);
    
    const currentColor = good.colors
        .find(
            color => color.id == colorId
        ) ?? good.colors[0];
    
    const images = currentColor.images;
    
    const currentInventory = good.inventory.filter(
        inv => inv.color_id === colorId
    );

    const isOneSize = good.inventory.length <= 1;

    const currentInventoryItem = currentInventory.find(
        item => item.id == currentInventoryId
    ) ?? currentInventory[0];

    const maxQuantity = currentInventoryItem.quantity ?? 0;
    const showQuantitySelector 
        = maxQuantity > 0 && (currentInventoryId !== null || isOneSize);

    useEffect(()=> {
        const resetQuantityValue = ()=> {
            setCurrentQuantity(0);
        }

        resetQuantityValue();
    }, [colorId, currentInventoryId]);

    const handleBasketBtnClick = async ()=> {
        if (currentQuantity <= 0 
            && 
            currentInventoryId !== null
        ) {
            setNotification({
                status: "alert",
                text: t("product.notifications.chooseSizeAndQuantity")
            });
            setIsPending(false);
            return ;
        }

        setIsPending(true);

        const good_register_id 
            = currentInventoryId ?? good.inventory[0].id;

        const basketRequestData: BasketCreateRequest = {
            good_register_id: good_register_id,
            quantity: currentQuantity
        }

        if (authStatus === "unauthenficated") {
            try {
                await guestBasketApi.addItem(basketRequestData);
                await mutateBasket();

                setCurrentQuantity(0);
                setCurrentInventoryId(null);

                setNotification({ 
                    status: "success", 
                    text: t("product.notifications.addedToBasket", {
                        name: good.name.slice(0, 15)
                    })
                });

            } catch (error) {
                setNotification({ 
                    status: "error", 
                    text: getApiErrorMessage(error, t, basketErrorMessages.addItem) 
                });
            } finally {
                setIsPending(false);
            }
            return ;
        } else if (authStatus === "authenficated") {

            const timeOutId = setTimeout(async () => {
                try {
                    await basketApi.addItem(basketRequestData);
                    await mutateBasket();
        
                    const goodNarrowedName = good.name.length > 15 
                        ? good.name.slice(0, 15) 
                        : good.name;
                    const message = t("product.notifications.addedToBasket", {
                        name: goodNarrowedName
                    });

                    setCurrentQuantity(0);
                    setCurrentInventoryId(null);
        
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
                    setIsPending(false);
                }
            }, 400);



            return ()=> clearTimeout(timeOutId);
        }
    }

    return (
        <article
            className={s.card}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <ImageSlider 
                images={images}
                goodId={good.id}
                goodName={good.name}
            />

            <Title
                isHovered={hover}
            >
                {good.name}
            </Title>

            <div className="flex items-center gap-2">
                <PriceTag
                    isHovered={hover}
                >
                    {good.price}
                </PriceTag>

                {showQuantitySelector &&
                        <QuantitySelector
                            maxQuantity={maxQuantity}
                            currentQuantity={currentQuantity}
                            setQuantity={setCurrentQuantity}
                        />
                }
            </div>

            <div className={s.card__params}>
                {good.colors &&
                    <ColorFeed
                        colors={good.colors}
                        goodName={good.name}
                        currentColorId={colorId}
                        setColorId={setColorId}
                    />
                }

                {(currentInventory.length > 0) &&
                    <SizeFeed
                        goodName={good.name}
                        inventory={currentInventory}
                        currentInventoryId={currentInventoryId}
                        setCurrentInventoryId={setCurrentInventoryId}
                    />
                }
            </div>

            <MainBtn
                onClick={handleBasketBtnClick}
            >
                {!isPending 
                    ? `🛒 ${t("product.actions.addToBasket")}`
                    : <CircularProgress
                        size={15}
                        color="inherit"
                    />
                }
            </MainBtn>
        </article>
    )
}
