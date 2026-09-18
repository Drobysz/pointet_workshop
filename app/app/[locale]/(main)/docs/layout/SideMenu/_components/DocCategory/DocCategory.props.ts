import { Dispatch, ReactNode, SetStateAction } from "react";
import { CursorCoordProps } from "../../types";

export interface DocCategoryProps {
    children: ReactNode;
    href: string;
    isActive: boolean;
    setCursorVertCoord: Dispatch<SetStateAction<CursorCoordProps>>;
    cursorVertClickedCoord: CursorCoordProps; 
    setCursorVertClickedCoord: Dispatch<SetStateAction<CursorCoordProps>>;
}