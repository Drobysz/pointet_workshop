import type { useTranslations } from "next-intl";

/**
 * Root-level translator (`useTranslations()` / `getTranslations()` without
 * a namespace). Helpers that live outside of React components — form
 * schemas, form actions, API error mapping — receive it as an argument
 * and address messages by their full key, e.g. `t("validation.emailRequired")`.
 */
export type AppTranslator = ReturnType<typeof useTranslations<never>>;

/** Full key of every message below the `errors` namespace. */
export type ErrorMessageKey = Extract<
    Parameters<AppTranslator>[0],
    `errors.${string}`
>;
