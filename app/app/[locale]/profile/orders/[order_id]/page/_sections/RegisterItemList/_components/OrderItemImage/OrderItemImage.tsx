import Image from "next/image";
import s from "./style.module.scss";
import { CircleX } from "lucide-react";
import { useTranslations } from "next-intl";

export const OrderItemImage = ({
    imageUrl,
    productName
}: {
    imageUrl: string | null;
    productName: string;
})=> {
    const t = useTranslations("preorders.item");

    return (
        <>
        {imageUrl ? (
            <div className={s.image_frame}>
                <Image
                    src={imageUrl}
                    alt={t("imageAlt", { name: productName })}
                    width={150}
                    height={300}
                />
            </div>
        ): (
            <div
                className={s.error_image_frame}
            >
                <CircleX
                    className="w-6 h-6"
                />
            </div>
        )}
        </>
    )
}
