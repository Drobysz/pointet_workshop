import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("privacy_policy", params);
}

export default function PrivacyPolicyPage({ params }: PageProps) {
    return <LegalDocumentPage slug="privacy_policy" params={params} />;
}
