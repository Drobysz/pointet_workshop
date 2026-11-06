"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { SlideSheet } from "@/components";
import { cn } from "@/helpers";
import { useMediaQuery } from "@/hooks";
import { jersey10 } from "@/fonts/fonts";
import {
    PriceRange,
    SubcategoryList,
} from "../CategoryAsideMenu/_components";
import s from "./style.module.scss";

// The aside filter menu is hidden below Tailwind `lg`.
const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Small-screen replacement of the aside menu: the same price and
 * subcategory filters, presented in a bottom sheet.
 */
export const MobileFilters = ()=> {
    const t = useTranslations("catalog.filters");
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const isMobile = useMediaQuery(MOBILE_QUERY);
    const isSheetOpen = isOpen && isMobile;

    const closeSheet = ()=> setIsOpen(false);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={cn(s.trigger, jersey10.className)}
                aria-haspopup="dialog"
                aria-expanded={isSheetOpen}
                onClick={()=> setIsOpen(true)}
            >
                <SlidersHorizontal className={s.trigger__icon} />
                <span className={s.trigger__title}>
                    {t("title")}
                </span>
            </button>

            <SlideSheet
                side="bottom"
                label={t("sheetLabel")}
                className={s.sheet}
                isOpen={isSheetOpen}
                onClose={closeSheet}
                triggerRef={triggerRef}
            >
                <header className={s.sheet__header}>
                    <h2 className={cn(s.sheet__title, jersey10.className)}>
                        {t("title")}
                    </h2>
                    <button
                        type="button"
                        className={s.sheet__close}
                        aria-label={t("closeLabel")}
                        onClick={closeSheet}
                    >
                        <X />
                    </button>
                </header>
                <PriceRange onApply={closeSheet} />
                <SubcategoryList onSelect={closeSheet} />
            </SlideSheet>
        </>
    )
}
