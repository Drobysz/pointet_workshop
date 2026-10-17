import { Good } from "@/api/types/goods"
import { GoodCard } from "@/components"
import s from "./style.module.scss";

export const Cards = ({
    goods
}: {
    goods: Good[]
})=> {
    return (
        <div className={s.cards_section}
        >
            {goods.map((good, idx)=>
                <GoodCard 
                    key={`good-card-category-${good.name}-${idx}`}
                    good={good}
                />
            )}
        </div>
    )
}
