import { cn } from "@/helpers";
import {
    SubcategoryList,
    PriceRange,
} from "./_components";
import s from "./style.module.scss";

export const CategoryAsideMenu = ({
    className
}: {
    className?: string;
})=> {
    return (
        <aside className={cn(
            className,
            s.aside_menu_tunnel
        )}>
            <div className={s.aside_menu_elevator}>
                <PriceRange />
                <SubcategoryList />
            </div>
        </aside>
    )
}
