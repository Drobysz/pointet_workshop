import { GridContainer } from "@/components"
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { sixCaps } from "@/fonts/fonts";
import {
    BagCard,
    FurnitureCard,
    CustomOrderCard
} from "./cards";

export const Categories = ()=> {


    return (
        <GridContainer
            innerClassName={s.container}
        >
            <h2
                className={cn(
                    s.title,
                    sixCaps.className
                )}
            >
                What to see next?
            </h2>
            <nav
                className={s.card_list}
            >
                <BagCard />
                <FurnitureCard />
                <CustomOrderCard />
            </nav>
        </GridContainer>
    )
}