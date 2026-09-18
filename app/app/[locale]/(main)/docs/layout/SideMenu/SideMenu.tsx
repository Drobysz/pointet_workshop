"use client";

import { cn } from "@/helpers";
import s from "./style.module.scss";
import { usePathname } from "next/navigation";
import {
    DocCategory,
    Cursor
} from "./_components";
import { useState } from "react";
import { CursorCoordProps } from "./types";
import { after, tinyFive } from "@/fonts/fonts";

export const SideMenu = ({
    className
}: {
    className: string;
})=> {
    const pathname = usePathname();
    const [hover, setHover] = useState(false);
    const defaultCoord = {left: 0, top: 0};
    const [cursorVertCoord, setCursorVertCoord] = useState<CursorCoordProps>(defaultCoord);
    const [cursorVertClickedCoord, setCursorVertClickedCoord] = useState<CursorCoordProps>(defaultCoord);

    const docs = [
        { href: "/docs/privacy_policy", label: "Privacy policy" },
        { href: "/docs/cookies_policy", label: "Cookies policy" },
    ];
    const isHidden = pathname.split('/').length < 4;

    return (
        <aside
            className={cn(
                className,
                "flex flex-col gap-2 relative"
            )}
        >
            <div 
                className={s.sticky_nav}
                onMouseEnter={()=> setHover(true)}
                onMouseLeave={()=> setHover(false)}
            >
                <h2 className={cn(
                    s.title,
                    hover && s.title_gradient,
                    tinyFive.className
                )}>
                    Categories
                </h2>
                <nav className={s.list_wrap}>
                    <ul className={s.list}>
                        {docs.map((p, i)=>
                            <DocCategory
                                key={`doc-${i}`}
                                href={p.href}
                                isActive={pathname.includes(p.href)}
                                cursorVertClickedCoord={cursorVertClickedCoord}
                                setCursorVertCoord={setCursorVertCoord}
                                setCursorVertClickedCoord={setCursorVertClickedCoord}
                            >
                                {p.label}
                            </DocCategory>
                        )}
                        <Cursor 
                            cursorCoord={cursorVertCoord}
                            isHidden={isHidden}
                        />
                    </ul>
                </nav>
            </div>
        </aside>
    )
}
