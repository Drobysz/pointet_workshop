"use client"

import { Tab } from "./_components/index";
import { usePathname } from "@/i18n/navigation";
import { TabListProps } from "./TabList.props";
import { PathService } from "@/helpers";
import { SplitByRowsText } from "@/components/animations/Texts/SplitByRowsText/SplitByRowsText";

export const TabList = ({
	paths,
	isTabListHovered,
	setPosition,
	setPositionClicked
}: TabListProps)=> {
	const pathname = usePathname();

	return (
		<>
			{paths.map(tab=> (
				<Tab
					key={"id_" + tab.label}
					isActive={PathService.getPageActivity(
						pathname, tab.href, tab.links
					)}
					isTabListHovered={isTabListHovered}
					setPosition={setPosition}
					setPositionClicked={setPositionClicked}
					href={tab.href ?? ""}
					list={tab.links ?? []} 
				>
					<SplitByRowsText
						tag="span"
					>
						{tab.label}
					</SplitByRowsText>
				</Tab>
			))}
		</>
	)
}
