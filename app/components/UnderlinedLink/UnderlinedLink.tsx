
import cn from "classnames";
import styles from "./ul.module.scss";
import { UnderlinedLinkProps } from "./UnderlinedLink.props";
import Link from "next/link";

export const UnderlinedLink = ({
	className,
	href,
	blank,
	children,
	colorLine = "light",
	...props
}: UnderlinedLinkProps)=> {
	return (
		<li
			className={cn(
				className,
				styles.underline_link
			)}
			{...props}
		>
			<Link 
				href={href}
				target={blank ? "_blank" : "_self"}
			>
				<span>{children}</span>
				<span className={cn(
					styles.underline, {
						["bg-white"]: colorLine == "light",
						["bg-gray-700"]: colorLine == "dark",
						["bg-blue-500"]: colorLine == "primary"
					}
				)}/>
			</Link>
		</li>
	)
}