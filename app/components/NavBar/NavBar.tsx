'use client'

import { CursorPosition } from "./types";
import { useState } from "react";
import cn from "classnames";
import { TabList, Cursor } from "./_components";
import { NavBarProps } from "./NavBar.props";

export const Navbar = ({
    className,
    paths,
}: NavBarProps)=>{
    const [hover, setHover] = useState(false);

    // Position when tab is being hovered
    const [position, setPosition] = useState<CursorPosition>({
        left: 0,
        width: 0,
    });

    // Position when tab was clicked
    const [positionClicked, setPositionClicked] = useState<CursorPosition>({
        left: 0,
        width: 0,
    });

    const handleMouseEnter = ()=> setHover(true);
    const handleMouseLeave = ()=> {
        setHover(false);
        setPosition(positionClicked)
    };

    return (
        <nav 
            className={cn(
                "h-full relative flex",
                "gap-2 items-center",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <TabList
                paths={paths}
                isTabListHovered={hover}
                setPosition={setPosition}
                setPositionClicked={setPositionClicked}
            />
            <Cursor position={position}/>
        </nav>
    );
};
