import Image from "next/image";
import type { CSSProperties } from "react";
import s from "../CurvedCard/style.module.scss";

const IMAGE_SIZES = "(min-width: 768px) 53vw, 78vw";

interface OutfitImageProps {
    src: string;
    alt: string;
    /** Loads the image at once instead of waiting for it to come near. */
    eager?: boolean;
    /** Id of the displacement filter curving the image, if any. */
    filterId?: string;
}

/** Outfit photo of a slide, shared by the animated and the static gallery. */
export const OutfitImage = ({
    src,
    alt,
    eager = false,
    filterId,
}: OutfitImageProps) => (
    <Image
        className={s.image}
        style={filterId
            ? { "--curve": `url("#${filterId}")` } as CSSProperties
            : undefined
        }
        src={src}
        alt={alt}
        fill
        sizes={IMAGE_SIZES}
        loading={eager ? "eager" : undefined}
    />
);
