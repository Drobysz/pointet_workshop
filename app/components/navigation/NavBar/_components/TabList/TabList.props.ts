import { CursorPosition, TabListType } from "../../types";

export interface TabListProps {
	paths: TabListType[];
	isTabListHovered: boolean;
	setPosition: ( PosProps : CursorPosition )=> void;
	setPositionClicked: ( PosProps : CursorPosition )=> void;
}
