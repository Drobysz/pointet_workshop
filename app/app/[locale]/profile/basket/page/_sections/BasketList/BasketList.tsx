import { BasketItem } from "@/api/types/basket";
import { UserBasketItem } from "../../_components";
import { Fragment } from "react/jsx-runtime";

export const BasketList = ({
    basketList
}: {
    basketList: BasketItem[];
})=> {
    const basketLength = basketList.length;

    return (
        <section className="w-full">
            <ul className="flex flex-col gap-3">
                {basketList.map((item, idx)=>
                    <Fragment
                        key={`basket-item-${idx}-${item.good_register_id}`}
                    >
                        <UserBasketItem
                            basketItem={item}
                        />

                        {idx < basketLength - 1 && 
                            <div 
                                className="w-full h-px bg-zinc-400"
                            />
                        }
                    </Fragment>
                )}
            </ul>
        </section>
    )
}
