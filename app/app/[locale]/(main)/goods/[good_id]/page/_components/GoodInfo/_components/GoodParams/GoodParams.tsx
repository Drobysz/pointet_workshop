import { Good } from "@/api/types/goods"
import s from "./style.module.scss";

function stringifyParams(
    item: number | string | string[]
) {
    if (["string", "number"].includes(typeof item)) {
        return item;
    } else if (typeof item === "object") {
        return item.join(", ");
    }
}

export const GoodParams = ({
    good
}: {
    good: Good;
})=> {
    const params = {
        "item number": good.id,
        "weigh": good.weigh,
        "brand": good.brand,
        "subcategory": good.subcategory.name,
        "materials": good.materials.map(m => m.name)
    };

    return (
        <ul className={s.params_list}>
            {Object.entries(params).map(([k, v])=>
                <li
                    key={`${good.name}-${k}`}
                    className={s.param}
                >
                    <span className={s.param__key}>
                        {k}
                    </span>
                    <div 
                        className={s.param__line}
                    />
                    <span className={s.param__value}>
                        {stringifyParams(v)}
                    </span>
                </li>
            )}
        </ul>
    )
}
