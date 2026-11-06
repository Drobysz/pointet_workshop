import { GridContainer } from "@/components"
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { sixCaps } from "@/fonts/fonts";
import { useTranslations } from "next-intl";
import {
    BagCard,
    FurnitureCard,
    CustomOrderCard
} from "./cards";

export const Categories = ()=> {
    const t = useTranslations("home.categories");

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
                {t("title")}
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