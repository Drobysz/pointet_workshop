"use client";

import { KeyboardEvent, useContext, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import s from "./style.module.scss";
import { ShopContext } from "../../../../context/shop.context";
import { Search } from "lucide-react";
import { cn } from "@/helpers";
import { useDismiss } from "@/hooks";

export const Searchbar = ()=> {
    const t = useTranslations("catalog.search");
    const { setGoodFilterParams } = useContext(ShopContext);

    const ref = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isMagnifierShifted = isHovered || isFocused;

    const handleDissmiss = ()=> {
        setIsFocused(false);
        ref.current?.blur();
    };

    useDismiss({
        isOpen: isFocused,
        refs: [ref],
        onDismiss: handleDissmiss
    });

    const handleSearchRequest = (
        e: KeyboardEvent<HTMLInputElement>
    )=> {
        if (e.key == "Enter") {
            setGoodFilterParams(p => ({
                ...p,
                search: value,
                page: 1,
            }))
        }
    };

    return (
        <div 
            className={s.searchbar_container}
            onMouseEnter={()=> setIsHovered(true)}
            onMouseLeave={()=> setIsHovered(false)}
        >
            <Search 
                className={cn(
                    s.magnifier_icon,
                    s.magnifier_icon_right,
                    isMagnifierShifted && "translate-x-11",
                    isFocused 
                        ? "text-red-700 scale-x-[-1]"
                        : "text-gray-500",
                )}
            />

            <input
                className={cn(
                    s.searchbar,
                )}
                ref={ref}
                type="search"
                placeholder={t("placeholder")}
                aria-label={t("inputLabel")}
                onKeyDown={handleSearchRequest}
                onChange={(e)=> setValue(e.target.value)}
                onFocus={()=> setIsFocused(true)}
                onBlur={()=> setIsFocused(false)}
            />

            <Search 
                className={cn(
                    s.magnifier_icon,
                    s.magnifier_icon_left,
                    isMagnifierShifted && "translate-x-10",
                    isFocused 
                        ? "text-red-700 scale-x-[-1]"
                        : "text-gray-500",
                )}
            />
        </div>
    )
}
