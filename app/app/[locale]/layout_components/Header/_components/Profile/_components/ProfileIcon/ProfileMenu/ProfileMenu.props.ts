import { DetailedHTMLProps, Dispatch, HTMLAttributes, SetStateAction } from "react";

export interface ProfileMenuProps
extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 {
    full_name: string;
    email: string;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}