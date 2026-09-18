import { DetailedHTMLProps, LiHTMLAttributes } from "react";

export interface UnderlinedLinkProps 
extends DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>{
	className?:    string;
	href:		   string;
	blank?: boolean;
	colorLine?:    "light" | "dark" | "primary" | "inherit";
}