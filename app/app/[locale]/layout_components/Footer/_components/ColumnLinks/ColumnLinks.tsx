import { doppelganger } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";
import footer from "@/json/footer_links.json";
import { UnderlinedLink } from "@/components/UnderlinedLink/UnderlinedLink";
import { Fragment } from "react/jsx-runtime";
import { LinkColumn } from "./types";

export const ColumnLinks = ()=> {
    const linkColumns: LinkColumn[] 
        = footer.column_links;

    return (
        <div
            className={s.nav_container}
        >
            {linkColumns.map((col, colId)=>
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
                        {col.label}
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
                                        {row.label}
                                    </UnderlinedLink>
                                }
                                {!row.link &&
                                    <li>
                                        {row.label}
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
