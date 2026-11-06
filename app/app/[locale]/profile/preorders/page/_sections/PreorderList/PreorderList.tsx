import { Preorder } from "@/api/types/preorder"
import { Fragment } from "react/jsx-runtime"
import { PreorderListItem } from "../../_components"

export const PreorderList = ({
    preOrdersList
}: {
    preOrdersList: Preorder[]
})=> {
    return (
        preOrdersList.map((preorder, idx)=>
            <Fragment
                key={`preorder-list-el-${preorder.id}`}
            >
                <PreorderListItem
                    preorder={preorder}
                />

                {idx < preOrdersList.length - 1 &&
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
