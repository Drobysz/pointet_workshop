import { Good } from "@/api/types/goods"
import { useTranslations } from "next-intl";
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
    const t = useTranslations("product.params");

    const params = [
        { labelKey: "itemNumber", value: good.id },
        { labelKey: "weight", value: good.weigh },
        { labelKey: "brand", value: good.brand },
        { labelKey: "subcategory", value: good.subcategory.name },
        { labelKey: "materials", value: good.materials.map(m => m.name) },
    ] as const;

    return (
        <ul className={s.params_list}>
            {params.map(({ labelKey, value })=>
                <li
                    key={`${good.name}-${labelKey}`}
                    className={s.param}
                >
                    <span className={s.param__key}>
                        {t(labelKey)}
                    </span>
                    <div 
                        className={s.param__line}
                    />
                    <span className={s.param__value}>
                        {stringifyParams(value)}
                    </span>
                </li>
            )}
        </ul>
    )
}
