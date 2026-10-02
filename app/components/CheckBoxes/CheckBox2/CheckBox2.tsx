"use client";

import { useState } from "react";
import s from "./styles.module.scss";
import cn from "classnames";

export const CheckBox2 = ()=> {
	const [checked, setCheck] = useState(false);

	return (
		<span
			className={cn(s.box, checked ? s.checked : s.unchecked)}
			onClick={() => setCheck((v) => !v)}
			role="checkbox"
			aria-checked={checked}
			tabIndex={0}
		>
			{!checked && <span className={s.dot} />}
		</span>
	)
}