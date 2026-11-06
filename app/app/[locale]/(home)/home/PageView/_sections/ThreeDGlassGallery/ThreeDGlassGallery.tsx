"use client";

import {
    CuratedObjects3D,
    SatinDress3D,
    SilverBag3D,
} from "@/components/3dObjects";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after } from "@/fonts/fonts";
import { ScrollShiftDown } from "./_components/ScrollShiftDown/ScrollShiftDown";

export const ThreeDGlassGallery = ()=> {
    return (
        <section className="relative">
            <ScrollShiftDown 
                className="
                    sticky top-0
                    bg-radial 
                    from-gray-200 
                    to-rose-400"
            >
                <CuratedObjects3D />
                <h2 className={cn(
                    s.title, "text-red-800",
                    // The longer headline needs a smaller size to fit phone widths.
                    "max-sm:text-4xl! max-sm:leading-14!",
                    after.className
                )}>
                    Discover the unexpected.
                </h2>
            </ScrollShiftDown>
            <ScrollShiftDown 
                className="
                    sticky top-0
                    bg-radial
                    from-gray-200
                    to-blue-400"
            >
                <SilverBag3D />
                <h2 className={cn(
                    s.title, "text-blue-800",
                    after.className
                )}>
                    Bags
                </h2>
            </ScrollShiftDown>
            <ScrollShiftDown 
                className="
                    sticky top-0
                    bg-radial
                    from-gray-200
                    to-lilac-400"
            >
                <SatinDress3D />
                <h2 className={cn(
                    s.title, "text-lilac-800",
                    after.className
                )}>
                    Clothing
                </h2>
            </ScrollShiftDown>
        </section>
    )
}
