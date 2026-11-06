"use client";

import { MouseEvent, useRef, useState } from "react";
import s from "./style.module.scss";
import { 
    MotionValue, 
    useScroll, 
    useTransform,
    motion,
    useMotionValue,
    useSpring,
} from "framer-motion";
import images from "@/json/images.json";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";

type MovingImageType = {
    img_src: string;
    left: string;
    top: string;
}

// Layout of the headline rows, in the order of the message's line breaks.
const TITLE_ROW_CLASS_NAMES = [
    cn(s.title__row_indented, "self-center"),
    s.title__row_indented,
    undefined,
    cn(s.title__row_shifted, "self-center"),
];

export const MovingImage = ({
    image,
    imagePiece,
    range,
    scrollYProgress,
    index,
    total,
}: {
    image: MovingImageType;
    imagePiece: number;
    range: [start: number, end: number];
    scrollYProgress: MotionValue<number>;
    index: number;
    total: number;
})=> {
    const t = useTranslations("home.scrollGallery");
    const [start, end] = range;
    const xCoordPercent = Number(image.left.slice(
        0, image.left.length - 1
    ));
    const direction = xCoordPercent < 42 ? 1 : -1;

    const rotateY = useTransform(
        scrollYProgress,
        [start, end + imagePiece * 4],
        [0, 55 * direction]
    );
    const z = useTransform(
        scrollYProgress,
        [start, end + imagePiece * 4],
        [-1000, 1000]
    );
    const scale = useTransform(
        scrollYProgress,
        [start, end],
        [0.8, 1]
    );
    const opacity = useTransform(scrollYProgress, (value) => {
        if (value < start || value > (end + imagePiece * 4)) {
            return 0;
        }
        const progress =
            (value - start) / ((end + imagePiece * 4) - start);
        return  progress;
    });

    return (
        <motion.div
            className={s.gallery_image_container}
            style={{
                position: "absolute",
                left: image.left,
                top: image.top,
                transformStyle: "preserve-3d",
                zIndex: total - index,
                opacity,
                rotateY,
                scale,
                z,
            }}
        >
            <Image
                className={s.gallery_image}
                src={image.img_src}
                width={250}
                height={500}
                sizes="100%"
                loading="eager"
                alt={t("imageAlt")}
            />
        </motion.div>
    )
}

export const ScrollGallery = ()=> {
    const t = useTranslations("home.scrollGallery");
    // The headline is one message; its line breaks define the staggered rows.
    const titleRows = t("title").split("\n");
    const refTunnel = useRef<HTMLDivElement | null>(null);
    const len = images.length;
    const imagePiece = 1/len;

    const [hover, setHover] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothShiftSet = {
        stiffness: 100,
        damping: 20,
        mass: 0.5,
    };

    const smoothX = useSpring(mouseX, smoothShiftSet);
    const smoothY = useSpring(mouseY, smoothShiftSet);

     const coords = { x: smoothX, y: smoothY  };

    const { scrollYProgress } = useScroll({
        target: refTunnel,
        offset: ["start start", "end end"]
    });
    const clipPath = useTransform(
        scrollYProgress,
        [0, 0.1, 1],
        [
            "inset(48% 49% 48% 49% round 100px)",
            "inset(0% 0% 0% 0%)",
            "inset(0% 0% 0% 0%)"
        ]
    );
    const filter = useTransform(
        scrollYProgress,
        [0, 0.1, 1],
        [
            "blur(20px)",
            "blur(0px)",
            "blur(0px)"
        ]
    );
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 1],
        [
            "#fbd9d3",
            "#fff",
        ]
    );
    const color = useTransform(
        scrollYProgress,
        [0, 1],
        [
            "#fff",
            "#BE9490",
        ]
    );

    const handleMouseMove = (event: MouseEvent<HTMLElement>)=> {
        const { clientX, clientY } = event;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = (clientX - (rect.left + rect.width / 2)) / 30;
        const y = (clientY - (rect.top + rect.height / 2)) / 20;

        mouseX.set(-x);
        mouseY.set(-y);
    };

    const handleMouseEnter = ()=> {
        setHover(true);
    };

    const handleMouseLeave = ()=> {
        setHover(false);
        mouseX.set(0);
        mouseY.set(0);
    };


    return (
        <motion.section
            className={s.tunnel}
            ref={refTunnel}
        >
            <motion.div
                className={s.elevator}
                style={{
                    clipPath,
                    backgroundColor,
                    filter,
                }}
            >
                <motion.h2
                    className={s.title}
                    style={{ color }}
                >
                    {titleRows.map((row, index) =>
                        <span
                            key={`title-row-${index}`}
                            className={TITLE_ROW_CLASS_NAMES[index]}
                        >
                            {row}
                        </span>
                    )}
                </motion.h2>
                <motion.div 
                    className={s.elevator_center_content}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        x: coords.x,
                        y: coords.y,
                    }}
                >
                    {images.map((img, i)=>
                        <MovingImage
                            key={`move-img-${i}`}
                            image={img}
                            imagePiece={imagePiece}
                            range={[
                                i/len,
                                i/len + imagePiece
                            ]}
                            scrollYProgress={scrollYProgress}
                            index={i}
                            total={len}
                        />
                    )}
                </motion.div>
            </motion.div>
        </motion.section>
    )
}
