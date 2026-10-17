"use client";

import { ProductColor } from "@/api/types/colors"
import s from "./style.module.scss"
import { cn } from "@/helpers";
import { Dispatch, SetStateAction } from "react";

export const ColorFeed = ({
    colors,
    goodName,
    currentColorId,
    setColorId
}: {
    colors: ProductColor[];
    goodName: string;
    currentColorId: number;

    setColorId: Dispatch<SetStateAction<number>>;
})=> {
    return (
        <ul className={s.color_feed}>
            {colors.map(color => 
                <li
                    key={`good-${goodName}-color-${color.name}`}
                    style={{
                        backgroundColor: color.hexcode
                    }}
                    className={cn(
                        s.color_feed__color,
                        color.id === currentColorId 
                            ? "ring-red-900" 
                            : "ring-transparent"
                    )}

                    onClick={()=> setColorId(color.id)}
                />
            )}
        </ul>
    )
}
