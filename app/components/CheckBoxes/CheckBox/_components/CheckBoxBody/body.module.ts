import { Dispatch, ReactNode, SetStateAction } from "react";

export interface CheckBoxProps {
	setChecked: Dispatch<SetStateAction<boolean>>;
	checked: boolean;
	children: ReactNode;
}