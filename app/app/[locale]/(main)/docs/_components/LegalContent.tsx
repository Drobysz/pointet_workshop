import { Fragment } from "react";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fillLegalVariables } from "../_content";
import type { ContentBlock, InlineContent } from "../_content";
import s from "./legal.module.scss";

type LegalContentProps = {
    blocks: ContentBlock[];
    /** Blocks that `{ shared: name }` refers to. */
    shared: Record<string, ContentBlock[]>;
    locale: Locale;
};

function InlineText({ parts, locale }: { parts: InlineContent[]; locale: Locale }) {
    return parts.map((part, index) => {
        if (typeof part === "string") {
            return <Fragment key={index}>{fillLegalVariables(part)}</Fragment>;
        }

        const text = fillLegalVariables(part.text);

        if (part.href) {
            const href = fillLegalVariables(part.href);

            return href.startsWith("/") ? (
                <Link key={index} href={href} locale={locale}>{text}</Link>
            ) : (
                <a key={index} href={href}>{text}</a>
            );
        }

        return part.strong
            ? <strong key={index}>{text}</strong>
            : <Fragment key={index}>{text}</Fragment>;
    });
}

export function LegalContent({ blocks, shared, locale }: LegalContentProps) {
    return blocks.map((block, index) => {
        if ("paragraph" in block) {
            return <p key={index}><InlineText parts={block.paragraph} locale={locale} /></p>;
        }

        if ("heading" in block) {
            return <h3 key={index}>{block.heading}</h3>;
        }

        if ("list" in block || "ordered" in block) {
            const List = "list" in block ? "ul" : "ol";
            const items = "list" in block ? block.list : block.ordered;

            return (
                <List key={index}>
                    {items.map((item, itemIndex) => (
                        <li key={itemIndex}><InlineText parts={item} locale={locale} /></li>
                    ))}
                </List>
            );
        }

        if ("table" in block) {
            return (
                // A wide table scrolls inside its own box instead of the page.
                <div key={index} className={s.table_wrap}>
                    <table>
                        <thead>
                            <tr>
                                {block.table.head.map((cell, cellIndex) => (
                                    <th key={cellIndex} scope="col">
                                        <InlineText parts={cell} locale={locale} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.table.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>
                                            <InlineText parts={cell} locale={locale} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        const sharedBlocks = shared[block.shared];

        if (!sharedBlocks) {
            throw new Error(`Unknown legal content block: ${block.shared}`);
        }

        return <LegalContent key={index} blocks={sharedBlocks} shared={shared} locale={locale} />;
    });
}
