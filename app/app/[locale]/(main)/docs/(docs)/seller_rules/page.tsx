import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("seller_rules", params);
}

export default function SellerRulesPage({ params }: PageProps) {
    return <LegalDocumentPage slug="seller_rules" params={params} />;
}
