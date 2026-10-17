"use client";

import { useContext } from "react";
import { ShopContext } from "../../context/shop.context";
import s from "./style.module.scss";
import {
    CategoryList,
    Searchbar
} from "./_components"

export const SortParamsSection = ()=> {
    const {} = useContext(ShopContext);

    return (
        <header 
            className={s.sort_params_container}
        >
            <Searchbar />
            <CategoryList />
        </header>
    )
}