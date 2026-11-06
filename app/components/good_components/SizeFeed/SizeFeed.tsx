"use client";

import { InventoryRow } from "@/api/types/inventory"
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after, tinyFive } from "@/fonts/fonts";
import { Dispatch, SetStateAction } from "react";

export const SizeFeed = ({
    inventory,
    goodName,
    currentInventoryId,
    setCurrentInventoryId,
}: {
    inventory: InventoryRow[];
    goodName: string;
    currentInventoryId: number | null;
    setCurrentInventoryId: Dispatch<SetStateAction<number | null>>;
})=> {
    const nonEmptyInventoryItems = 
        inventory.filter(item => item.quantity > 0);

    return (
        <ul className={s.size_feed}>
            {nonEmptyInventoryItems.map(invItem=> 
                <li
                    key={`good-${goodName}-color-${invItem.color_id}-size-${invItem.id}`}
                >
                    <button
                        className={cn(
                            s.size_feed__item,
                            currentInventoryId == invItem.id
                                && s.isActive
                        )}

                        onClick={()=> setCurrentInventoryId(invItem.id)}
                    >
                        {Number(invItem.quantity) > 0 &&
                            <>
                                <span className={cn(
                                    after.className,
                                    "text-xs"
                                )}>
                                    {invItem.size}
                                </span>

                                <span className={cn(
                                    tinyFive.className,
                                    "text-xs"
                                )}>
                                    {invItem.quantity}
                                </span>
                            </>
                        }
                    </button>
                </li>
            )}
        </ul>
    )
}
