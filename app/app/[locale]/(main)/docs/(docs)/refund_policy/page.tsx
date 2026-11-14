import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("refund_policy", params);
}

export default function RefundPolicyPage({ params }: PageProps) {
    return <LegalDocumentPage slug="refund_policy" params={params} />;
}
