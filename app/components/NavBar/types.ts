import { ReactNode } from "react";

export interface CursorPosition {
    left: number;
    width: number;
};

export interface CursorProps {
    position: CursorPosition;
};

export type TabListType = {
	href?: string;
	label: string;
	links?: TabListType[];
}

export interface Tabprops {
    children: ReactNode;
    href?: string;
    list: TabListType[];
    isActive: boolean;
    isTabListHovered: boolean;
    setPosition: ( PosProps : CursorPosition )=> void;
    setPositionClicked: ( PosProps : CursorPosition )=> void;
};

