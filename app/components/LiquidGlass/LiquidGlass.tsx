"use client";

import { ReactNode, useState } from "react";
import styles from "./lg.module.scss";
import cn from "classnames";
import { Filter } from "./_components/Filter";
import { useMotionValueEvent, useScroll } from "framer-motion";

export const LiquidGlass = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		if (latest > 50) {
			setIsScrolled(true);
		} else {
			setIsScrolled(false);
		}
	});

	return (
		<div
			className={styles.liquidGlass_wrapper}>
			<Filter />

			<div className={styles.liquidGlass_effect} />
			<div className={styles.liquidGlass_tint} />
			<div 
				className={styles.liquidGlass_shine} 
			/>

			<div className={cn(
				className,
				styles.liquidGlass_content
			)}>
				{children}
			</div>
		</div>
	);
};
