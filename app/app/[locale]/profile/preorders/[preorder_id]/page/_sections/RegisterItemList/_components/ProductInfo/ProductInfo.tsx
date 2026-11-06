import { jersey10, tinyFive } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";

export const ProductInfo = ({
    size,
    colorName,
    productName
}: {
    size: string | null;
    colorName: string | null;
    productName: string;
})=> {
    return (
        <div className={s.info_column}>
            <h3 className={cn(
                tinyFive.className,
                "text-2xl"
            )}> 
                {productName} 
            </h3>

            <div className="flex gap-2">
                {colorName &&
                    <span className={cn(
                        s.tag,
                        jersey10.className
                    )}>
                        {colorName}
                    </span>
                }

                {size &&
                    <span className={cn(
                        s.tag,
                        jersey10.className
                    )}>
                        {size}
                    </span>
                }
            </div>
        </div>
    )
}
