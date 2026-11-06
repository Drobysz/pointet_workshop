import { JsonLdData } from "@/helpers/structuredData";

/**
 * Renders schema.org structured data. `<` is escaped so that
 * user-provided strings can never close the script tag.
 */
export const JsonLd = ({
    data
}: {
    data: JsonLdData | JsonLdData[];
})=> {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    )
}
