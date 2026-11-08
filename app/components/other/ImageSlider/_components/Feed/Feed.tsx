"use client";

import { ProductImage } from "@/api/types/productImages";
import Image from "next/image";
import s from "./style.module.scss";
import { PanInfo, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useRef, WheelEvent } from "react";
import { useTranslations } from "next-intl";

export const Feed = ({
    images,
    imgIdx,
    setImgIdx,
    sizes,
    goodName,
}: {
    images: ProductImage[];
    imgIdx: number;
    setImgIdx: Dispatch<SetStateAction<number>>;
    /** Rendered width hint, so the optimizer serves a fitting image. */
    sizes: string;
    /** Used to build descriptive alternative texts. */
    goodName?: string;
})=> {
    const t = useTranslations("ui.imageSlider");
    const containerRef = useRef<HTMLUListElement | null>(null);
    const itemsRef = useRef<Array<HTMLLIElement | null>>([]);

    const scrollToCurrentImage = (behavior: ScrollBehavior = "smooth")=> {
        const container = containerRef.current;
		const el = itemsRef.current[imgIdx];

        if (!container) return;

        if (imgIdx === 0) {
            container.scrollTo({ left: 0, behavior: behavior });
            return;
        }

        if (!el) return;

        container.scrollTo({
			behavior: behavior,
			left: el.offsetLeft - container.offsetLeft
		});
    }

    useEffect(()=> {
        scrollToCurrentImage("smooth");
    }, [imgIdx])

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        let previousWidth = container.clientWidth;
        let previousHeight = container.clientHeight;

        
        const observer = new ResizeObserver(()=> {
            const width = container.clientWidth;
            const height = container.clientHeight;

            if (
                width === previousWidth &&
                height === previousHeight
            ) return;

            previousWidth = width;
            previousHeight = height;
            scrollToCurrentImage("instant");
        });

        observer.observe(container);

        return ()=> {
            observer.disconnect();
        }

	});

    const SWIPE_DISTANCE = 50;
    const SWIPE_VELOCITY = 500;
    const lastIdx = images.length - 1;

    const WHEEL_DISTANCE = 20;
    const wheelDeltaRef = useRef(0);
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wheelLockedRef = useRef(false);

    const goNext = () => {
        setImgIdx((prev) => Math.min(prev + 1, lastIdx));
    }

    const goPrev = () => {
        setImgIdx((prev) => Math.max(prev - 1, 0));
    };

    const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
        if (wheelLockedRef.current) return;

        const delta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;

        if (wheelTimeoutRef.current) {
            clearTimeout(wheelTimeoutRef.current);
        }

        wheelTimeoutRef.current = setTimeout(() => {
            wheelDeltaRef.current = 0;
        }, 120);

        if (Math.abs(wheelDeltaRef.current) < WHEEL_DISTANCE) return;
        
        if (e.deltaX > 0) {
            goNext();
        } else {
            goPrev();
        }

        wheelLockedRef.current = true;

        setTimeout(() => {
            wheelLockedRef.current = false;
        }, 500);
    };

    const handleSwipe = (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      const isSwipeLeft =
        info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY;

      const isSwipeRight =
        info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY;

      if (!setImgIdx 
          || imgIdx === undefined 
          || lastIdx === undefined
      ) return;

      if (isSwipeLeft) {
        goNext();
      }

      if (isSwipeRight) {
        goPrev();
      }
    };

    return (
        <motion.ul 
            className={s.feed}
            ref={containerRef}
            onPanEnd={handleSwipe}
            onWheelCapture={handleWheel}
        >
            {images.map((img, idx)=> 
                <li
                    key={`img-card-${img.name}-${idx}`}
                    className="relative w-full h-full shrink-0"

                    ref={(el) => {
                        itemsRef.current[idx] = el;
                    }}
                >
                    {img.url &&
                        <Image
                            className="object-cover" 
                            src={img.url}
                            fill
                            sizes={sizes}
                            alt={goodName
                                ? t("photoAlt", { name: goodName, number: idx + 1 })
                                : t("photoAltFallback", { number: idx + 1 })
                            }
                        />
                    }
                </li>
            )}
        </motion.ul>
    )
}
