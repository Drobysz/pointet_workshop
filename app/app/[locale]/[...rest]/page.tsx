import { notFound } from "next/navigation";

/**
 * Unknown URLs inside a locale would otherwise skip the locale layout.
 * Catching them here renders the localized `not-found.tsx` instead.
 */
export default function CatchAllPage() {
    notFound();
}
