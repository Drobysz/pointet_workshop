"use client";

import { Category } from "@/api/types/category"
import { useContext, useState } from "react";
import { ShopContext } from "../../../../context/shop.context";
import s from "./style.module.scss";
import Image from "next/image";
import { cn } from "@/helpers";
import { jersey10, tinyFive } from "@/fonts/fonts";

const CategoryCard = ({
    category
}: {
    category: Category
})=> {
    const { 
        currentCategory, 
        setGoodFilterParams 
    } = useContext(ShopContext);

    const [hover, setHover] = useState(false);
    const isActive
        = currentCategory?.name === category.name;

    const handleCardClick = ()=> {
        if (isActive) return;

        setGoodFilterParams(p => ({
            ...p,
            category_id: category.id,
            subcategory_id: 0
        }));
    };

    return (
        <li
            className={cn(isActive && s.current_category)}
            onClick={handleCardClick}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <span
                hidden={!isActive}
                className={cn(
                    s.current_category__title,
                    tinyFive.className
                )}
            >
                Current category
            </span>
            <div className={cn(
                isActive && s.current_category__wrapper,
                s.category_card,
                s.card_transition
            )}>
                <span className={cn(
                    s.category_card__title,
                    s.card_transition,
                    jersey10.className
                )}>
                    {category.name}
                </span>
                {(category.image && category.image.url !== null) &&
                    <Image
                        className={cn(
                            hover && "scale-x-[-1.3] scale-y-[1.3]",
                            s.category_icon,
                            s.card_transition,
                        )}
                        src={category.image?.url}
                        width={30}
                        height={30}
                        loading="eager"
                        alt="category icon"
                    />
                }
            </div>
        </li>
    )
}

export const CategoryList = ()=> {
    const { categories } = useContext(ShopContext);

    return (
        <ul className={s.category_list}>
            {categories.map((ctg, idx)=>
                <CategoryCard 
                    key={`cat-${ctg.name}-${idx}`}
                    category={ctg}
                />
            )}
        </ul>
    )
}
