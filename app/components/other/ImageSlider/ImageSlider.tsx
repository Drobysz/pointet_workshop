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
// import { useWindowWidth } from "@/hooks";

export const ImageSlider = ({
    images,
    goodId,
    isHrefActive = true,
    isLarge = false,
    className,
}: {
    images: ProductImage[];
    goodId: number;
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

    // const isDesktop = useWindowWidth(560) as boolean;

    return (
        <div
            className={cn(
                className,
                s.slider,
                isLarge ? "h-150" : "h-87.5 cursor-pointer"
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
                    />
                </Lens>
            )}
            {!isLarge &&
                <Feed
                    images={images}
                    imgIdx={imgIdx}
                    setImgIdx={setImgIdx}
                />
            }
        </div>
    )
}
