import cn from "classnames";
import styles from "./ul.module.scss";
import { UnderlinedLinkProps } from "./UnderlinedLink.props";
import { Link } from "@/i18n/navigation";



export const UnderlinedInnerLink = ({
	className,
	href,
	blank,
	children,
	colorLine = "light",
}: UnderlinedLinkProps)=> {
	return (
		<span className="relative">
			<Link
				href={href}
				target={blank ? "_blank" : "_self"}
				className={cn(
					className,
					styles.underline_link
				)}
			>
				<span>{children}</span>
				<span className={cn(
					styles.underline, {
						["bg-white"]: colorLine == "light",
						["bg-gray-700"]: colorLine == "dark",
						["bg-red-300"]: colorLine == "primary",
						["bg-red-700"]: colorLine == "red",
						["bg-inherit"]: colorLine == "inherit",
					}
				)}/>
			</Link>
		</span>
	)
}
