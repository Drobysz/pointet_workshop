export const supportedLocales = ["en", "fr", "de", "it", "ru"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const defaultLocale: AppLocale = "fr";
export const localeCookieName = "admin_locale";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return supportedLocales.some((locale) => locale === value);
}
