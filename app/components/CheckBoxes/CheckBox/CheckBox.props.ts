import { Dispatch, SetStateAction } from "react";

export interface CheckBoxProps {
    type: "over-category" | "sub-category";
    checked: boolean;
    setChecked: Dispatch<SetStateAction<boolean>>;
}