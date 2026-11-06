"use client";

import { useContext, useState } from "react";
import { ShopContext } from "../../../../context/shop.context";
import { Subcategory } from "@/api/types/subcategory";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";
import { ChevronRight } from "lucide-react";

const SubcategoryItem = ({
    subcategory,
    isListHovered,
    onSelect
}: {
    subcategory: Subcategory;
    isListHovered: boolean;
    onSelect?: ()=> void;
})=> {
    const { 
        currentSubcategory,
        setCurrentSubcategory
    } = useContext(ShopContext);
    const [hover, setHover] = useState(false);

    const isSubcategoryChosen 
        = currentSubcategory?.name === subcategory.name;
    const isActive = 
        (isSubcategoryChosen && !isListHovered)
        ||
        hover;

    const handleClick = ()=> {
        setCurrentSubcategory(subcategory.id);
        onSelect?.();
    }

    return (
        <li 
            className={cn(
                s.subcat_item_container,
                s.subcat_item_trans,
                jersey10.className
            )}

            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
            onClick={handleClick}
        >
            <ChevronRight 
                className={cn(
                    s.left_arrow,
                    s.subcat_item_trans,
                    "w-8 h-8",
                    isActive 
                        ? "translate-x-1 text-red-700"
                        : "-translate-x-7"
                )}
            />
            <span
                className={cn(
                    s.subcat_item_trans,
                    isActive && 
                        "translate-x-6 text-red-700",
                    isActive && tinyFive.className
                )}
            >
                {subcategory.name}
            </span>

            <ChevronRight 
                className={cn(
                    s.subcat_item_trans,
                    "w-8 h-8",
                    isActive && 
                        "translate-x-8 text-red-700"
                )}
            />
        </li>
    )
}

export const SubcategoryList = ({
    onSelect
}: {
    /** Called after a subcategory is chosen, e.g. to close a sheet. */
    onSelect?: ()=> void;
})=> {
    const { currentCategory } = useContext(ShopContext);
    const [hover, setHover] = useState(false);

    const currentSubcategories = currentCategory?.subcategories;

    return (
        <div className={s.subcat_list_container}>
            <ul 
                className={s.subcat_list}

                onMouseEnter={()=> setHover(true)}
                onMouseLeave={()=> setHover(false)}
            >
                {currentSubcategories &&
                    currentSubcategories.map(
                        (subcategory, idx)=> (
                            <SubcategoryItem
                                key={`subcategory-${subcategory.name}-${idx}`}
                                subcategory={subcategory}
                                isListHovered={hover}
                                onSelect={onSelect}
                            />
                        ))
                }
            </ul>
        </div>
    )
}
