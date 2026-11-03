import { Suspense } from "react";
import { SuccessView } from "./SuccessView";

export default function SuccessPage() {
    return (
        <Suspense fallback={<main className="px-5 py-16">Checking your payment…</main>}>
            <SuccessView />
        </Suspense>
    );
}
