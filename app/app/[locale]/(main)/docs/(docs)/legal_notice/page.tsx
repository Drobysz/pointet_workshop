import { getLegalMetadata, LegalDocumentPage } from "../../_components/LegalDocumentPage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export function generateMetadata({ params }: PageProps) {
    return getLegalMetadata("legal_notice", params);
}

export default function LegalNoticePage({ params }: PageProps) {
    return <LegalDocumentPage slug="legal_notice" params={params} />;
}
