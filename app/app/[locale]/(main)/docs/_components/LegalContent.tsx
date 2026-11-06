import { Fragment } from "react";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/navigation";
import content from "./content.json";

type InlineContent = string | {
    text: string;
    href?: string;
    internal?: boolean;
    strong?: boolean;
    breakBefore?: boolean;
};

type ContentBlock = {
    paragraph?: InlineContent[];
    heading?: string;
    list?: InlineContent[][];
    shared?: string;
};

type LegalContentProps = {
    blocks: ContentBlock[];
    locale: Locale;
};

const sharedBlocks: Record<string, ContentBlock[]> = content.blocks;

function InlineText({ parts, locale }: { parts: InlineContent[]; locale: Locale }) {
    return parts.map((part, index) => {
        if (typeof part === "string") {
            return <Fragment key={index}>{part}</Fragment>;
        }

        if (part.href) {
            return part.internal ? (
                <Link key={index} href={part.href} locale={locale}>{part.text}</Link>
            ) : (
                <a key={index} href={part.href}>{part.text}</a>
            );
        }

        if (part.strong) {
            return <strong key={index}>{part.text}</strong>;
        }

        return (
            <Fragment key={index}>
                {part.breakBefore && <br />}
                {part.text}
            </Fragment>
        );
    });
}

export function LegalContent({ blocks, locale }: LegalContentProps) {
    return blocks.map((block, index) => {
        if (block.paragraph) {
            return <p key={index}><InlineText parts={block.paragraph} locale={locale} /></p>;
        }

        if (block.heading) {
            return <h3 key={index}>{block.heading}</h3>;
        }

        if (block.list) {
            return (
                <ul key={index}>
                    {block.list.map((item, itemIndex) => (
                        <li key={itemIndex}><InlineText parts={item} locale={locale} /></li>
                    ))}
                </ul>
            );
        }

        if (block.shared) {
            const shared = sharedBlocks[block.shared];

            if (!shared) {
                throw new Error(`Unknown legal content block: ${block.shared}`);
            }

            return <LegalContent key={index} blocks={shared} locale={locale} />;
        }

        return null;
    });
}
