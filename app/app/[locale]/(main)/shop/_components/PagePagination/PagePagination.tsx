"use client";

import s from "./style.module.scss";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";
import { getPageItems } from "@/helpers";
import { useWindowWidth } from "@/hooks";
import { useContext } from "react";
import { ShopContext } from "../../context/shop.context";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

export const PagesPagination = ()=> {
    const {
        goodsPagination,
        goodFilterParams,
        setGoodFilterParams
    } = useContext(ShopContext);

    const page = goodFilterParams.page ?? 1;
    const page_nb = goodsPagination?.meta.last_page ?? 0;

    const isLimitLong = useWindowWidth(560) as boolean;
    
    const pageItems: PageItem[] = getPageItems(
        page, page_nb, isLimitLong
    );
    
    const setPage = (idx: number)=> {
        setGoodFilterParams(p => ({
            ...p,
            page: idx
        }));
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSwitcherClick = (switcher: "left" | "right")=> {
        switch (switcher) {
            case "left":
                if (page - 1 > 0) {
                    setPage(page - 1);
                    scrollToTop();
                }
                break;

            case "right":
                if (page + 1 <= page_nb) {
                    setPage(page + 1);  
                    scrollToTop(); 
                }
                break;
        
            default:
                break;
        }
    }

    const handleSelectorClick = (page: number)=> {
        setPage(page);
        scrollToTop();
    }

    return (
        <>
            {page && page_nb > 1 && (
                <nav className="flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-4 max-[560px]:gap-2.5">
                        <button 
                            className={cn(
                                s.switcher,
                                page > 1 
                                    ? s.switcher_active 
                                    : s.switcher_inactive
                            )}
                            onClick={()=> handleSwitcherClick("left")}
                        >
                            <ChevronLeft
                                width={25}
                                height={25}
                            />
                        </button>
                        <ul className="flex gap-2 max-[560px]:gap-1">
                            {pageItems.map((pi)=> {
                                if (typeof pi !== "number") {
                                    return (
                                        <span className={s.ellipsis} key={pi}>
                                            …
                                        </span>
                                    )
                                }

                                return(
                                    <li
                                        key={`page_setter_${pi}`}
                                        className={cn(
                                            s.page_sel,
                                            page === pi
                                                ? s.page_sel_active
                                                : s.page_sel_inactive
                                        )}
                                        onClick={()=> handleSelectorClick(pi)}
                                    >
                                        <span>
                                            {pi}
                                        </span>
                                    </li>
                                )})}
                        </ul>
                        <button 
                            className={cn(s.switcher,
                                page < page_nb 
                                    ? s.switcher_active 
                                    : s.switcher_inactive
                            )}
                            onClick={()=> handleSwitcherClick("right")}
                        >
                            <ChevronRight
                                width={25}
                                height={25}
                            />
                        </button>
                    </div>
                </nav>
            )}
        </>
    )
}
