import { CursorPosition, TabListType } from "@/components/NavBar/types";

export interface TabListProps {
	paths: TabListType[];
	isTabListHovered: boolean;
	setPosition: ( PosProps : CursorPosition )=> void;
	setPositionClicked: ( PosProps : CursorPosition )=> void;
}
