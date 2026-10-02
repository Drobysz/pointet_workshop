import { DetailedHTMLProps, HTMLAttributes } from "react";
import { TabListType } from "./types";

export interface NavBarProps
extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
{
    className?: string;
    paths: TabListType[];
}