import { jersey10, tinyFive } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";

export const TitleHeader = ({
    goodName,
    categoryName,
    subcategoryName
}: {
    goodName: string;
    categoryName: string;
    subcategoryName: string;
})=> {
    return (
        <header className={s.header}>
            <h1 className={cn(
                s.header__title,
                jersey10.className,
            )}>
                {goodName}
            </h1>

            <ul className={cn(
                s.header__tag_container, 
                tinyFive.className
            )}>
                <span className={s.header__tag}>
                    {categoryName}
                </span>

                <span className={s.header__tag}>
                    {subcategoryName}
                </span>
            </ul>
        </header>
    )
}
