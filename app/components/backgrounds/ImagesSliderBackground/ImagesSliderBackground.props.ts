import { ReactNode } from "react";

export type Direction = 1 | -1;

export interface ImagesSliderBackgroundProps {
    images: string[];
    activeIndex: number;
    direction: Direction;
    className?: string;
    children?: ReactNode;
}
