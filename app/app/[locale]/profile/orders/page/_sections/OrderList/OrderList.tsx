import { Fragment } from "react/jsx-runtime"
import { OrderListItem } from "../../_components"
import { Order } from "@/api/types/orders"

export const OrderList = ({
    ordersList
}: {
    ordersList: Order[]
})=> {
    return (
        ordersList.map((order, idx)=>
            <Fragment
                key={`preorder-list-el-${order.id}`}
            >
                <OrderListItem
                    order={order}
                />

                {idx < ordersList.length - 1 &&
                    <div 
                        className="
                            w-full 
                            shrink-0 
                            bg-zinc-300 
                            h-0.5
                        "
                    />
                }
            </Fragment>
        )
    )
}
