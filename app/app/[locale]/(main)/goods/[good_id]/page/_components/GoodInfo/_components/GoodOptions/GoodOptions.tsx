"use client";

import { Good } from "@/api/types/goods"
import {
    ColorFeed,
    SizeFeed,
    QuantitySelector,
} from "@/components";
import { useContext } from "react";
import { GoodContext } from "../../../../../context/good.context";

export const GoodOptions = ({
    good,
}: {
    good: Good;
})=> {
    const {
        currentColorId,
        currentInventoryId,
        currentQuantity,

        setCurrentColorId,
        setCurrentInventoryId,
        setCurrentQuantity
    } = useContext(GoodContext);

    const currentInventoryItem = good.inventory.find(
        inv => inv.id == currentInventoryId
    );
    const currentColorIventoryItems = good.inventory.filter(
        inv => inv.color_id == currentColorId && inv.quantity > 0
    );
    const maxQuantity = currentInventoryItem?.quantity ?? 0;
    const isOneSize = good.inventory.length <= 1;
    const showQuantitySelector 
        = maxQuantity > 0 && (currentInventoryId !== null || isOneSize);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-5">
                <ColorFeed 
                    colors={good.colors}
                    goodName={good.name}
                    currentColorId={currentColorId}
                    setColorId={setCurrentColorId}
                />

                {showQuantitySelector &&
                    <QuantitySelector 
                        maxQuantity={maxQuantity}
                        currentQuantity={currentQuantity}
                        setQuantity={setCurrentQuantity}
                    />
                }
            </div>

            <SizeFeed 
                inventory={currentColorIventoryItems}
                goodName={good.name}
                currentInventoryId={currentInventoryId}
                setCurrentInventoryId={setCurrentInventoryId}
            />
        </div>
    )
}
