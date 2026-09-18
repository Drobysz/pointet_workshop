"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import rawImages from "./images";
import { cn } from "@/helpers";
import { useWindowWidth } from "@/hooks/useWindowWidth";

const GROUP_HEIGHT = 1800;

function ImagesGroup() {
  const isDesktop = useWindowWidth(550) as boolean;
  const mobileImages = rawImages.filter((_, index) => index % 2 != 0);
  const outputImages = isDesktop ? rawImages : mobileImages;

  return (
    <div
      className="relative shrink-0"
      style={{ height: GROUP_HEIGHT }}
    >
      {outputImages.map((image, index) => {
        const floatDuration = 8 + (index % 4) * 2;
        const floatDelay = index * 0.2;

        return (
          <motion.div
            key={`${image.src}-${index}`}
            className="absolute rounded-2xl overflow-hidden"
            style={{
              left: image.left,
              top: image.top,
              rotate: image.rotate ?? 0,
              width: image.width,
              height: image.width,
            }}
            animate={{
              x: [0, 12, -7, 0],
              y: [0, -12, 6, 0],
            }}
            transition={{
              duration: floatDuration,
              delay: floatDelay,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={image.src}
              alt={image.alt ?? ""}
              draggable={false}
              loading={index < 3 ? "eager" : "lazy"}
              fill
              sizes={`${image.width}px`}
              className="object-cover"
            />
          </motion.div>
        )
      })}
    </div>
  );
}

export default function AscendingImagesBackground({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        className,
        "pointer-events-none absolute",
        "inset-0 overflow-hidden",
      )}
    >
      <motion.div
        className="flex w-full flex-col"
        animate={{
          y: [-GROUP_HEIGHT, 0],
        }}
        transition={{
          duration: 12,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <ImagesGroup />
        <ImagesGroup />
      </motion.div>
    </div>
  );
}
