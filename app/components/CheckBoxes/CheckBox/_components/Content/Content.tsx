import CheckIcon from "@/assets/checked.svg";
import s from "../../styles.module.scss";

export const Content = ({
	checked, type
}: {
	checked: boolean,
	type: "over-category" | "sub-category"
})=> {
	return (
		<>
			{checked && type == "over-category" &&
				<hr className={s.line}/>
			}
			{checked && type == "sub-category" &&
				<CheckIcon className="text-white"/>
			}
		</>
	)
}