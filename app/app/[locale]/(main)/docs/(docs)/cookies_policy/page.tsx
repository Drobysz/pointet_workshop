import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("cookies_policy", params);
}

export default function CookiesPolicyPage({ params }: PageProps) {
    return <LegalDocumentPage slug="cookies_policy" params={params} />;
}
