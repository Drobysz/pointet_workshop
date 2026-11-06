import { doppelganger } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";
import { footerColumnLinks } from "../../footerLinks";
import { UnderlinedLink } from "@/components/animations/UnderlinedLink/UnderlinedLink";
import { Fragment } from "react/jsx-runtime";
import { RowLink } from "./types";
import { useTranslations } from "next-intl";

export const ColumnLinks = ()=> {
    const t = useTranslations("navigation");

    const getRowLabel = (row: RowLink)=>
        "labelKey" in row ? t(row.labelKey) : row.text;

    return (
        <div
            className={s.nav_container}
        >
            {footerColumnLinks.map((col, colId)=>
                <div
                    key={`footer-col-${colId}`}
                    className={s.title_column_distance}
                >
                    <h3
                        className={cn(
                            doppelganger.className,
                            "text-4xl"
                        )}
                    >
                        {t(`footer.columns.${col.titleKey}`)}
                    </h3>
                    <ul className={s.column_element_gap}>
                        {col.rows.map((row, rowId)=>
                            <Fragment
                                key={`footer-col-${colId}-row-${rowId}`}
                            >
                                {row.link && 
                                    <UnderlinedLink
                                        key={`footer-col-${colId}-row-${rowId}`}
                                        href={row.link}
                                    >
                                        {getRowLabel(row)}
                                    </UnderlinedLink>
                                }
                                {!row.link &&
                                    <li>
                                        {getRowLabel(row)}
                                    </li>
                                }
                            </Fragment>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
