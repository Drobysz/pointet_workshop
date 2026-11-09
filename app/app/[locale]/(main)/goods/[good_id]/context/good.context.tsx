"use client";

import { createContext, ReactNode, useState } from "react";
import { GoodContextInterface } from "./good.interface";
import { Good } from "@/api/types/goods";
import { ProductColor } from "@/api/types/colors";

const emptyColor: ProductColor = {
    images: [],
    id: 0,
    name: "",
    hexcode: "",
};

export const GoodContext = createContext<GoodContextInterface>({
    currentColor: emptyColor,

    currentColorId: 0,
    setCurrentColorId: () => {},

    currentInventoryId: 0,
    setCurrentInventoryId: () => {},

    currentQuantity: 0,
    setCurrentQuantity: () => {},
});

export const GoodContextProvider = ({
    good,
    children,
}: {
    good: Good;
    children: ReactNode;
})=> {
    const isOneSize = good.inventory.length <= 1;

    const [
        currentColorId, 
        setCurrentColorId
    ] = useState(good.colors[0].id);

    const [
        currentInventoryId, 
        setCurrentInventoryId
    ] = useState<number | null>(
        isOneSize 
            ? (good.inventory[0].id ?? null) 
            : null
    );
 
    const [
        currentQuantity, 
        setCurrentQuantity
    ] = useState(0);

    const currentColor = good.colors.find(
        color => color.id == currentColorId
    ) ?? good.colors[0];
    

    return (
        <GoodContext.Provider
            value={{
                currentColor: currentColor,
                currentColorId: currentColorId,
                currentInventoryId: currentInventoryId,
                currentQuantity: currentQuantity,

                setCurrentColorId,
                setCurrentInventoryId,
                setCurrentQuantity
            }}
        >
            {children}
        </GoodContext.Provider>
    )
}
