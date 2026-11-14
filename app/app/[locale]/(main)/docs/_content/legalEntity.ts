/**
 * The identity of the business that operates the site is configuration, not
 * copy: the documents reference it as `{{LEGAL_SIREN}}`, `{{LEGAL_ADDRESS}}`…
 * and the values come from the environment (see `.env.example`).
 */
const LEGAL_VARIABLE = /\{\{(LEGAL_[A-Z_]+)\}\}/g;

export function fillLegalVariables(text: string): string {
    // A variable that is not configured stays visible as "[LEGAL_SIREN]", so
    // a missing value is noticed instead of silently leaving a gap.
    return text.replace(
        LEGAL_VARIABLE,
        (_, name: string) => process.env[name]?.trim() || `[${name}]`,
    );
}
