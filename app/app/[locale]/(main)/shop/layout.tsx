import { categoryApi } from "@/api/api";
import { ReactNode } from "react";
import { ShopContextProvider } from "./context/shop.context";
import s from "./layout.module.scss";
import {
    CategoryAsideMenu,
    SortParamsSection,
} from "./layout_components"

export default async function ShopLayout({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    const { data: categories } = await categoryApi.getCategories();

    return (
        <ShopContextProvider
            categories={categories}
        >
            <div className={s.shop_grid_container}>
                <CategoryAsideMenu 
                    className={s.aside_menu}
                />
                <div className={s.good_side_container}>
                    <SortParamsSection />
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </ShopContextProvider>
    )
}
