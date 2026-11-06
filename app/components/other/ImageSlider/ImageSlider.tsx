"use client";

import { ProductImage } from "@/api/types/productImages"
import s from "./style.module.scss";
import { useState } from "react";
import {
    Feed,
    Switchers,
    CardPagination,
} from "./_components";
import { Lens } from "@/components/animations/Lens/Lens";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/helpers";

// Without a `sizes` hint a `fill` image is treated as full-viewport wide
// and the largest source gets downloaded for every card.
const CARD_IMAGE_SIZES =
    "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 320px";
const LARGE_IMAGE_SIZES =
    "(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 400px";

export const ImageSlider = ({
    images,
    goodId,
    isHrefActive = true,
    isLarge = false,
    goodName,
    className,
}: {
    images: ProductImage[];
    goodId: number;
    goodName?: string;
    isHrefActive?: boolean;
    isLarge?: boolean;
    className?: string;
})=> {
    const router = useRouter();

    const [hover, setHover] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);

    const handleClick = ()=> {
        if (isHrefActive) {
            router.push(`/goods/${goodId}`);
        }
    };

    return (
        <div
            className={cn(
                className,
                s.slider,
                isLarge ? "h-150 max-lg:h-120 max-md:h-112" : "h-87.5 cursor-pointer"
        )}

            onClick={handleClick}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <Switchers 
                hover={hover}
                imgIdx={imgIdx}
                lastIdx={images.length - 1}
                setImgIdx={setImgIdx}
            />
            <CardPagination 
                hover={hover}
                imgIdx={imgIdx}
                qntty={images.length}
                setImgIdx={setImgIdx}
            />
            {isLarge && (
                <Lens>
                    <Feed
                        images={images}
                        imgIdx={imgIdx}
                        setImgIdx={setImgIdx}
                        sizes={LARGE_IMAGE_SIZES}
                        goodName={goodName}
                    />
                </Lens>
            )}
            {!isLarge &&
                <Feed
                    images={images}
                    imgIdx={imgIdx}
                    setImgIdx={setImgIdx}
                    sizes={CARD_IMAGE_SIZES}
                    goodName={goodName}
                />
            }
        </div>
    )
}
