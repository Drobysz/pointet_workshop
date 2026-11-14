import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("seller_policy", params);
}

export default function SellerPolicyPage({ params }: PageProps) {
    return <LegalDocumentPage slug="seller_policy" params={params} />;
}
