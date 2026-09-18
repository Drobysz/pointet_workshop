"use client";

import { 
    SilverFork3D, 
    SilverPlate3D, 
    WineGlass3D 
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
                <WineGlass3D />
                <h2 className={cn(
                    s.title, "text-red-800",
                    after.className
                )}>
                    We sell tableware.
                </h2>
            </ScrollShiftDown>
            <ScrollShiftDown 
                className="
                    sticky top-0
                    bg-radial
                    from-gray-200
                    to-blue-400"
            >
                <SilverPlate3D />
                <h2 className={cn(
                    s.title, "text-blue-800",
                    after.className
                )}>
                    Plates
                </h2>
            </ScrollShiftDown>
            <ScrollShiftDown 
                className="
                    sticky top-0
                    bg-radial
                    from-gray-200
                    to-lilac-400"
            >
                <SilverFork3D />
                <h2 className={cn(
                    s.title, "text-lilac-800",
                    after.className
                )}>
                    Сutlery
                </h2>
            </ScrollShiftDown>
        </section>
    )
}
