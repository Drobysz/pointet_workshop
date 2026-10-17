"use client";

import { CheckBoxProps } from "./body.module";
import cn from "classnames";
import s from "../../styles.module.scss";

export const CheckBoxBody = ({
	children,
	checked,
	setChecked
}: CheckBoxProps)=> {
	const checkStyle = "border-red-300 bg-red-300";

	return (
		<span
			className={cn(
				s.checkbox_view,
				"border-2 border-gray-400",
				checked && checkStyle
			)}
			onClick={()=> setChecked((v)=> !v)}
			aria-checked={checked}
			role="checkbox"
		>
			{children}
		</span>
	)
}