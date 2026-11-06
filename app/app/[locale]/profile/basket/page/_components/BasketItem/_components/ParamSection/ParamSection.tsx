"use client";

import { BasketItem } from "@/api/types/basket";
import { 
    Trash,
    Share,
} from "lucide-react"
import Image from "next/image"
import s from "./style.module.scss";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export const ParamSection = ({
    basketItem,
    onDelete,
}: {
    basketItem: BasketItem;
    onDelete?: () => void;
})=> {
    const t = useTranslations("basket.item");
    const good = basketItem.good;
    const imageUrl = basketItem.images[0].url;
    const hexcode = basketItem.color?.hexcode;
    const size = basketItem.inventory?.size;
    // Locale-aware internal path of the product page.
    const goodUrl = `/goods/${good.id}`;

    return (
        <div className={s.params_container}>
            {imageUrl &&
                <Image
                    src={imageUrl}
                    className="rounded-2xl"
                    width={100}
                    height={180}
                    alt={t("imageAlt", { name: basketItem.good.name })}
                />
            }
            
            <div className={s.params_list}>
                <h2 className={s.title}>
                    {good.name}
                </h2>

                <div className="flex items-center gap-2">
                    {size &&
                        <span className={s.size}>
                            {basketItem.inventory?.size}
                        </span>
                    }

                    <div
                        style={{ backgroundColor: hexcode }}
                        className={s.color}
                    />
                </div>

                <div className={s.btn_container}>
                    <Link 
                        className={s.basket_btn} 
                        href={goodUrl}
                        target="_blank"
                        aria-label={t("openProduct")}
                    >
                        <Share
                            className="w-5 h-5"
                        />
                    </Link>

                    <button 
                        className={s.basket_btn}
                        type="button"
                        aria-label={t("remove")}
                        onClick={onDelete}
                    >
                        <Trash
                            className="w-5 h-5"
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
